// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IERC20Burnable {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title SourceVault
 * @notice Lock / burn source-chain RWA (Ondo, xStocks, bStocks mocks) before Mezo wrap.
 *         User flow in MetaMask: approve → lock. Pegforge UI then switches to Mezo and claims wrap.
 */
contract SourceVault {
    address public owner;
    mapping(address => bool) public accepted; // source RWA token
    mapping(address => mapping(address => uint256)) public locked; // user => token => amount
    mapping(bytes32 => bool) public lockConsumed;

    event TokenAccepted(address indexed token, bool ok);
    event Locked(
        address indexed user,
        address indexed token,
        uint256 amount,
        bytes32 indexed lockId,
        uint256 destChainId
    );

    error NotOwner();
    error BadToken();
    error BadAmount();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setAccepted(address token, bool ok) external onlyOwner {
        accepted[token] = ok;
        emit TokenAccepted(token, ok);
    }

    /// @notice Approve this vault, then lock. Emits lockId for Mezo PegforgePortal.claimWrap.
    function lock(address token, uint256 amount, uint256 destChainId) external returns (bytes32 lockId) {
        if (!accepted[token]) revert BadToken();
        if (amount == 0) revert BadAmount();
        bool ok = IERC20Burnable(token).transferFrom(msg.sender, address(this), amount);
        require(ok, "TRANSFER");
        locked[msg.sender][token] += amount;
        lockId = keccak256(
            abi.encode(msg.sender, token, amount, destChainId, block.chainid, block.number, block.timestamp)
        );
        emit Locked(msg.sender, token, amount, lockId, destChainId);
    }
}
