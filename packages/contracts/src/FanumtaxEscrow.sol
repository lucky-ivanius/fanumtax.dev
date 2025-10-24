// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IFanumtaxEscrow} from "./interfaces/IFanumtaxEscrow.sol";

/**
 * @title FanumtaxEscrow
 * @notice Upgradeable escrow contract for managing bounty deposits on GitHub issues
 * @dev Uses UUPS upgrade pattern. EscrowId = keccak256(abi.encodePacked(repository, number, token))
 * @dev 2.5% protocol fee is deducted from claims
 */
contract FanumtaxEscrow is UUPSUpgradeable, OwnableUpgradeable, IFanumtaxEscrow {
    using SafeERC20 for IERC20;

    // Constants
    /// @notice Protocol fee in basis points (2.5% = 250 basis points)
    uint256 public constant FEE_BASIS_POINTS = 250;
    uint256 public constant BASIS_POINTS_DIVISOR = 10000;

    // Storage
    /// @notice Address of the prover contract authorized to claim bounties
    address public proverContract;

    /// @notice Mapping of escrowId to Escrow data
    mapping(bytes32 => Escrow) private escrows;

    /// @notice Mapping of escrowId => depositor => amount
    mapping(bytes32 => mapping(address => uint96)) private deposits;

    /// @notice Accumulated protocol fees per token
    mapping(address => uint256) public accumulatedFees;

    // Modifiers
    /// @notice Restricts function access to only the prover contract
    modifier onlyProver() {
        if (msg.sender != proverContract) revert Unauthorized();
        _;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Initialize the contract
     * @param _owner Initial owner address
     */
    function initialize(address _owner) external initializer {
        __Ownable_init(_owner);
        __UUPSUpgradeable_init();
    }

    /**
     * @inheritdoc IFanumtaxEscrow
     */
    function deposit(uint256 repository, uint256 number, address token, uint96 amount) external {
        if (token == address(0)) revert InvalidToken();
        if (amount == 0) revert InvalidAmount();

        bytes32 escrowId = _computeEscrowId(repository, number, token);

        Escrow storage escrow = escrows[escrowId];

        // Initialize escrow if first deposit
        if (escrow.token == address(0)) {
            escrow.token = token;
        }

        // Update escrow total amount
        escrow.totalAmount += amount;

        // Update depositor's amount
        deposits[escrowId][msg.sender] += amount;

        // Transfer tokens from depositor
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        emit Deposited(escrowId, msg.sender, token, amount, repository, number);
    }

    /**
     * @inheritdoc IFanumtaxEscrow
     */
    function claim(bytes32 escrowId, address recipient) external onlyProver {
        _claim(escrowId, recipient);
    }

    /**
     * @inheritdoc IFanumtaxEscrow
     */
    function withdraw(bytes32 escrowId, address depositor, address recipient) external onlyProver {
        _withdraw(escrowId, depositor, recipient);
    }

    /**
     * @inheritdoc IFanumtaxEscrow
     */
    function batchClaim(bytes32[] calldata escrowIds, address recipient) external onlyProver {
        uint256 length = escrowIds.length;
        for (uint256 i = 0; i < length; ++i) {
            _claim(escrowIds[i], recipient);
        }
    }

    /**
     * @inheritdoc IFanumtaxEscrow
     */
    function batchWithdraw(bytes32[] calldata escrowIds, address depositor, address recipient) external onlyProver {
        uint256 length = escrowIds.length;
        for (uint256 i = 0; i < length; ++i) {
            _withdraw(escrowIds[i], depositor, recipient);
        }
    }

    /**
     * @inheritdoc IFanumtaxEscrow
     */
    function setProverContract(address _proverContract) external onlyOwner {
        if (_proverContract == address(0)) revert InvalidProverContract();

        address oldProver = proverContract;
        proverContract = _proverContract;

        emit ProverContractUpdated(oldProver, _proverContract);
    }

    /**
     * @inheritdoc IFanumtaxEscrow
     */
    function collect(address token) external onlyOwner {
        _collect(token, msg.sender);
    }

    /**
     * @inheritdoc IFanumtaxEscrow
     */
    function batchCollect(address[] calldata tokens) external onlyOwner {
        uint256 length = tokens.length;
        for (uint256 i = 0; i < length; ++i) {
            _collect(tokens[i], msg.sender);
        }
    }

    /**
     * @inheritdoc IFanumtaxEscrow
     */
    function getEscrow(bytes32 escrowId) external view returns (Escrow memory) {
        return escrows[escrowId];
    }

    /**
     * @inheritdoc IFanumtaxEscrow
     */
    function getAmount(bytes32 escrowId, address depositor) external view returns (uint96) {
        return deposits[escrowId][depositor];
    }

    /**
     * @notice Internal function to claim escrow funds
     * @param escrowId Escrow identifier
     * @param recipient Address to receive the funds
     */
    function _claim(bytes32 escrowId, address recipient) internal {
        Escrow storage escrow = escrows[escrowId];

        if (escrow.token == address(0)) revert EscrowNotFound();
        if (escrow.claimed) revert EscrowAlreadyClaimed();

        uint96 amount = escrow.totalAmount;
        if (amount == 0) revert InvalidAmount();

        // Calculate fee (2.5%)
        uint96 fee = uint96((uint256(amount) * FEE_BASIS_POINTS) / BASIS_POINTS_DIVISOR);
        uint96 netAmount = amount - fee;

        // Mark as claimed
        escrow.claimed = true;

        // Accumulate fee
        accumulatedFees[escrow.token] += fee;

        // Transfer net amount to recipient
        IERC20(escrow.token).safeTransfer(recipient, netAmount);

        emit Claimed(escrowId, recipient, netAmount, fee);
    }

    /**
     * @notice Internal function to withdraw depositor's funds
     * @param escrowId Escrow identifier
     * @param depositor Address of the depositor
     * @param recipient Address to receive the funds
     */
    function _withdraw(bytes32 escrowId, address depositor, address recipient) internal {
        Escrow storage escrow = escrows[escrowId];

        if (escrow.token == address(0)) revert EscrowNotFound();
        if (escrow.claimed) revert EscrowAlreadyClaimed();

        uint96 amount = deposits[escrowId][depositor];
        if (amount == 0) revert NoDepositFound();

        // Update state before transfer
        deposits[escrowId][depositor] = 0;
        escrow.totalAmount -= amount;

        // Transfer funds to recipient
        IERC20(escrow.token).safeTransfer(recipient, amount);

        emit Withdrawn(escrowId, depositor, recipient, amount);
    }

    /**
     * @notice Internal function to collect accumulated fees for a token
     * @param token ERC20 token address
     * @param recipient Address to receive the fees
     */
    function _collect(address token, address recipient) internal {
        uint256 fees = accumulatedFees[token];
        if (fees == 0) revert NoFeesToCollect();

        accumulatedFees[token] = 0;
        IERC20(token).safeTransfer(recipient, fees);

        emit FeesCollected(token, recipient, fees);
    }

    /**
     * @notice Compute escrow ID from repository, issue number, and token
     * @param repository GitHub repository ID
     * @param number GitHub issue number
     * @param token ERC20 token address
     * @return Escrow identifier
     */
    function _computeEscrowId(uint256 repository, uint256 number, address token) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(repository, number, token));
    }

    /**
     * @dev Function that should revert when `msg.sender` is not authorized to upgrade the contract.
     * Called by {upgradeToAndCall}.
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
