// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IMintableRWA {
    function mint(address to, uint256 amount) external;
}

interface IRwaExpressMarket {
    function expressOpen(
        address user,
        address token,
        uint256 collateralAmount,
        uint256 musdAmount
    ) external;
}

/**
 * @title PegforgePortal
 * @notice Mezo wrap portal for RWA collateral.
 *
 * Express (Mezo-only, 1 tx): expressLoan — demo mint into market + borrow.
 *
 * Full bridge:
 *  1. Source (Sepolia/Base): mint mock → approve → SourceVault.lock (real lock + Locked event)
 *  2. Mezo (1 tx): claimExpressLoan — lockId must match SourceVault preimage for msg.sender
 *     then mint wrap into market + borrow. Cannot claim someone else's lock.
 *
 * Production: replace preimage claim with Wormhole NTT / LZ attestation of the source lock.
 */
contract PegforgePortal {
    address public owner;
    bool public testnetMode = true;
    IRwaExpressMarket public market;
    mapping(bytes32 => address) public mezoToken;
    mapping(bytes32 => bool) public claimed;
    mapping(uint256 => bool) public allowedSourceChain;

    event AssetWired(bytes32 indexed assetId, address mezoToken);
    event SourceChainAllowed(uint256 chainId, bool ok);
    event TestnetMode(bool on);
    event MarketUpdated(address indexed market);
    event ExpressLoan(
        address indexed user,
        bytes32 indexed assetId,
        address indexed token,
        uint256 collateral,
        uint256 musdAmount
    );
    event WrapClaimed(
        address indexed user,
        bytes32 indexed assetId,
        bytes32 indexed lockId,
        uint256 amount,
        uint256 sourceChainId
    );

    error NotOwner();
    error BadAsset();
    error BadAmount();
    error AlreadyClaimed();
    error BadSource();
    error BadLock();
    error TestnetOff();
    error NoMarket();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setMezoToken(bytes32 assetId, address token) external onlyOwner {
        mezoToken[assetId] = token;
        emit AssetWired(assetId, token);
    }

    function setSourceChain(uint256 chainId, bool ok) external onlyOwner {
        allowedSourceChain[chainId] = ok;
        emit SourceChainAllowed(chainId, ok);
    }

    function setTestnetMode(bool on) external onlyOwner {
        testnetMode = on;
        emit TestnetMode(on);
    }

    function setMarket(address market_) external onlyOwner {
        market = IRwaExpressMarket(market_);
        emit MarketUpdated(market_);
    }

    /// @dev Must match SourceVault.lockId = keccak256(user, token, amount, destChainId, sourceChainId, block, time)
    function lockIdFor(
        address user,
        address sourceToken,
        uint256 amount,
        uint256 destChainId,
        uint256 sourceChainId,
        uint256 sourceBlock,
        uint256 sourceTime
    ) public pure returns (bytes32) {
        return keccak256(
            abi.encode(user, sourceToken, amount, destChainId, sourceChainId, sourceBlock, sourceTime)
        );
    }

    /**
     * @notice Mezo-only Express desk (1 MetaMask). Does not require a source-chain lock.
     */
    function expressLoan(
        bytes32 assetId,
        uint256 collateralAmount,
        uint256 musdAmount,
        uint256 sourceChainId
    ) external {
        if (!testnetMode) revert TestnetOff();
        if (address(market) == address(0)) revert NoMarket();
        address token = mezoToken[assetId];
        if (token == address(0)) revert BadAsset();
        if (collateralAmount == 0 || musdAmount == 0) revert BadAmount();
        if (!allowedSourceChain[sourceChainId] && sourceChainId != 0) revert BadSource();

        bytes32 lockId = keccak256(
            abi.encode(
                "express",
                msg.sender,
                assetId,
                collateralAmount,
                musdAmount,
                sourceChainId,
                block.timestamp
            )
        );
        if (claimed[lockId]) revert AlreadyClaimed();
        claimed[lockId] = true;

        IMintableRWA(token).mint(address(market), collateralAmount);
        market.expressOpen(msg.sender, token, collateralAmount, musdAmount);

        emit WrapClaimed(msg.sender, assetId, lockId, collateralAmount, sourceChainId);
        emit ExpressLoan(msg.sender, assetId, token, collateralAmount, musdAmount);
    }

    /**
     * @notice Full bridge claim: prove you locked on source (lockId preimage), wrap into market, borrow.
     *         One Mezo MetaMask confirm after Sepolia/Base lock.
     */
    function claimExpressLoan(
        bytes32 assetId,
        address sourceToken,
        uint256 amount,
        uint256 musdAmount,
        uint256 sourceChainId,
        uint256 sourceBlock,
        uint256 sourceTime,
        bytes32 lockId
    ) external {
        if (address(market) == address(0)) revert NoMarket();
        address token = mezoToken[assetId];
        if (token == address(0)) revert BadAsset();
        if (amount == 0 || musdAmount == 0) revert BadAmount();
        if (!allowedSourceChain[sourceChainId]) revert BadSource();
        if (claimed[lockId]) revert AlreadyClaimed();

        // destChainId in the vault hash is Mezo (this chain)
        bytes32 expected = lockIdFor(
            msg.sender,
            sourceToken,
            amount,
            block.chainid,
            sourceChainId,
            sourceBlock,
            sourceTime
        );
        if (expected != lockId) revert BadLock();

        claimed[lockId] = true;
        IMintableRWA(token).mint(address(market), amount);
        market.expressOpen(msg.sender, token, amount, musdAmount);

        emit WrapClaimed(msg.sender, assetId, lockId, amount, sourceChainId);
        emit ExpressLoan(msg.sender, assetId, token, amount, musdAmount);
    }

    /**
     * @notice Claim wrap only (to wallet) — same lockId binding as claimExpressLoan.
     */
    function claimWrap(
        bytes32 assetId,
        address sourceToken,
        uint256 amount,
        uint256 sourceChainId,
        uint256 sourceBlock,
        uint256 sourceTime,
        bytes32 lockId
    ) external {
        address token = mezoToken[assetId];
        if (token == address(0)) revert BadAsset();
        if (amount == 0) revert BadAmount();
        if (!allowedSourceChain[sourceChainId]) revert BadSource();
        if (claimed[lockId]) revert AlreadyClaimed();

        bytes32 expected = lockIdFor(
            msg.sender,
            sourceToken,
            amount,
            block.chainid,
            sourceChainId,
            sourceBlock,
            sourceTime
        );
        if (expected != lockId) revert BadLock();

        claimed[lockId] = true;
        IMintableRWA(token).mint(msg.sender, amount);
        emit WrapClaimed(msg.sender, assetId, lockId, amount, sourceChainId);
    }
}
