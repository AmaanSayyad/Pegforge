// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
}

/**
 * @title RwaMUSDMarket
 * @notice Multi-asset collateral market: tokenized US stocks, gold, silver, crude oil → borrow MUSD.
 *         Expands Mezo's BTC-only MUSD CDP with a parallel RWA collateral desk.
 *
 *         Per-asset: oracle price, max LTV, liquidation threshold.
 *         Demo: owner seeds MUSD liquidity + sets prices. Production: Chainlink/RWA oracles + allowlisted issuers.
 */
contract RwaMUSDMarket {
    struct AssetConfig {
        bool listed;
        uint256 priceUsd; // 18 decimals
        uint256 maxLtvBps;
        uint256 liqThresholdBps;
    }

    struct Position {
        uint256 collateral; // asset wei
        uint256 debt; // MUSD wei
    }

    IERC20 public immutable musd;
    address public owner;
    /// @notice PegforgePortal (or Express router) allowed to open loans in one tx.
    address public expressOperator;

    mapping(address => AssetConfig) public assets; // collateral token => config
    mapping(address => mapping(address => Position)) public positions; // user => asset => position

    event AssetListed(address indexed token, uint256 priceUsd, uint256 maxLtvBps, uint256 liqBps);
    event PriceUpdated(address indexed token, uint256 priceUsd);
    event ExpressOperatorUpdated(address indexed operator);
    event Deposit(address indexed user, address indexed token, uint256 amount);
    event Borrow(address indexed user, address indexed token, uint256 musdAmount);
    event Repay(address indexed user, address indexed token, uint256 musdAmount);
    event Withdraw(address indexed user, address indexed token, uint256 amount);
    event Liquidate(
        address indexed user,
        address indexed token,
        address indexed liquidator,
        uint256 repaid,
        uint256 seized
    );

    error NotOwner();
    error NotExpress();
    error NotListed();
    error BadAmount();
    error Undercollateralized();
    error Healthy();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor(address musdToken) {
        musd = IERC20(musdToken);
        owner = msg.sender;
    }

    function setExpressOperator(address operator) external onlyOwner {
        expressOperator = operator;
        emit ExpressOperatorUpdated(operator);
    }

    /**
     * @notice One-tx Express desk: credit collateral already held by this contract
     *         (minted here by Portal.expressLoan) and send MUSD to `user`.
     */
    function expressOpen(
        address user,
        address token,
        uint256 collateralAmount,
        uint256 musdAmount
    ) external {
        if (msg.sender != expressOperator) revert NotExpress();
        if (!assets[token].listed) revert NotListed();
        if (user == address(0) || collateralAmount == 0 || musdAmount == 0) revert BadAmount();

        Position storage p = positions[user][token];
        p.collateral += collateralAmount;
        p.debt += musdAmount;
        if (ltvBps(user, token) > assets[token].maxLtvBps) revert Undercollateralized();
        require(musd.transfer(user, musdAmount), "MUSD");

        emit Deposit(user, token, collateralAmount);
        emit Borrow(user, token, musdAmount);
    }

    function listAsset(
        address token,
        uint256 priceUsd,
        uint256 maxLtvBps,
        uint256 liqThresholdBps
    ) external onlyOwner {
        require(maxLtvBps > 0 && maxLtvBps <= liqThresholdBps && liqThresholdBps <= 9000, "LTV");
        assets[token] = AssetConfig(true, priceUsd, maxLtvBps, liqThresholdBps);
        emit AssetListed(token, priceUsd, maxLtvBps, liqThresholdBps);
    }

    function setPrice(address token, uint256 priceUsd) external onlyOwner {
        if (!assets[token].listed) revert NotListed();
        assets[token].priceUsd = priceUsd;
        emit PriceUpdated(token, priceUsd);
    }

    function collateralUsd(address user, address token) public view returns (uint256) {
        AssetConfig memory a = assets[token];
        Position memory p = positions[user][token];
        return (p.collateral * a.priceUsd) / 1e18;
    }

    function ltvBps(address user, address token) public view returns (uint256) {
        uint256 c = collateralUsd(user, token);
        if (c == 0) return 0;
        return (positions[user][token].debt * 10000) / c;
    }

    function maxBorrow(address user, address token) public view returns (uint256) {
        AssetConfig memory a = assets[token];
        uint256 c = collateralUsd(user, token);
        uint256 cap = (c * a.maxLtvBps) / 10000;
        uint256 debt = positions[user][token].debt;
        if (cap <= debt) return 0;
        return cap - debt;
    }

    function deposit(address token, uint256 amount) external {
        if (!assets[token].listed) revert NotListed();
        if (amount == 0) revert BadAmount();
        require(IERC20(token).transferFrom(msg.sender, address(this), amount), "ASSET");
        positions[msg.sender][token].collateral += amount;
        emit Deposit(msg.sender, token, amount);
    }

    function borrow(address token, uint256 musdAmount) external {
        if (!assets[token].listed) revert NotListed();
        if (musdAmount == 0) revert BadAmount();
        positions[msg.sender][token].debt += musdAmount;
        if (ltvBps(msg.sender, token) > assets[token].maxLtvBps) revert Undercollateralized();
        require(musd.transfer(msg.sender, musdAmount), "MUSD");
        emit Borrow(msg.sender, token, musdAmount);
    }

    function repay(address token, uint256 musdAmount) external {
        if (musdAmount == 0) revert BadAmount();
        Position storage p = positions[msg.sender][token];
        uint256 pay = musdAmount > p.debt ? p.debt : musdAmount;
        require(musd.transferFrom(msg.sender, address(this), pay), "MUSD");
        p.debt -= pay;
        emit Repay(msg.sender, token, pay);
    }

    function withdraw(address token, uint256 amount) external {
        Position storage p = positions[msg.sender][token];
        if (amount == 0 || amount > p.collateral) revert BadAmount();
        p.collateral -= amount;
        if (p.debt > 0 && ltvBps(msg.sender, token) > assets[token].maxLtvBps) {
            p.collateral += amount;
            revert Undercollateralized();
        }
        require(IERC20(token).transfer(msg.sender, amount), "ASSET");
        emit Withdraw(msg.sender, token, amount);
    }

    function liquidate(address user, address token, uint256 repayMusd) external {
        AssetConfig memory a = assets[token];
        if (!a.listed) revert NotListed();
        if (ltvBps(user, token) < a.liqThresholdBps) revert Healthy();

        Position storage p = positions[user][token];
        uint256 pay = repayMusd > p.debt ? p.debt : repayMusd;
        require(musd.transferFrom(msg.sender, address(this), pay), "MUSD");
        p.debt -= pay;

        uint256 seizeUsd = (pay * 11000) / 10000; // 10% bonus
        uint256 seize = (seizeUsd * 1e18) / a.priceUsd;
        if (seize > p.collateral) seize = p.collateral;
        p.collateral -= seize;
        require(IERC20(token).transfer(msg.sender, seize), "ASSET");
        emit Liquidate(user, token, msg.sender, pay, seize);
    }
}