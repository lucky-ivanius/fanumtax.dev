// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

interface IFanumtaxEscrow {
    /**
     * @notice Escrow data structure
     * @dev Storage optimized: uint96 + address (20 bytes) + bool = 29 bytes (fits in one slot)
     * @param totalAmount Total amount deposited in escrow (uint96 allows up to ~79B tokens with 18 decimals)
     * @param token ERC20 token address (address = 20 bytes)
     * @param claimed Whether the escrow has been claimed by prover
     */
    struct Escrow {
        uint96 totalAmount;
        address token;
        bool claimed;
    }

    // Events
    event Deposited(
        bytes32 indexed escrowId,
        address indexed depositor,
        address indexed token,
        uint96 amount,
        uint256 repository,
        uint256 number
    );

    event Claimed(bytes32 indexed escrowId, address indexed recipient, uint96 amount, uint96 fee);

    event Withdrawn(bytes32 indexed escrowId, address indexed depositor, address indexed recipient, uint96 amount);

    event ProverContractUpdated(address indexed oldProver, address indexed newProver);

    event FeesCollected(address indexed token, address indexed recipient, uint256 amount);

    // Errors
    error InvalidToken();
    error InvalidAmount();
    error EscrowNotFound();
    error EscrowAlreadyClaimed();
    error Unauthorized();
    error NoDepositFound();
    error TransferFailed();
    error InvalidProverContract();
    error NoFeesToCollect();

    /**
     * @notice Deposit tokens into an escrow for a specific repository issue
     * @dev EscrowId is calculated as keccak256(abi.encodePacked(repository, number, token)) internally
     * @param repository GitHub repository ID
     * @param number GitHub issue number
     * @param token ERC20 token address
     * @param amount Amount to deposit
     */
    function deposit(uint256 repository, uint256 number, address token, uint96 amount) external;

    /**
     * @notice Claim all escrow funds (only callable by prover contract when issue is solved)
     * @param escrowId Escrow identifier
     * @param recipient Address to receive the funds
     */
    function claim(bytes32 escrowId, address recipient) external;

    /**
     * @notice Withdraw depositor's funds from unclaimed escrow (only callable by prover after verification)
     * @dev Prover contract verifies conditions (e.g., issue abandoned, not near completion) before calling
     * @param escrowId Escrow identifier
     * @param depositor Address of the depositor whose funds to withdraw
     * @param recipient Address to receive the funds
     */
    function withdraw(bytes32 escrowId, address depositor, address recipient) external;

    /**
     * @notice Batch claim multiple escrows (only callable by prover contract)
     * @param escrowIds Array of escrow identifiers
     * @param recipient Address to receive all funds
     */
    function batchClaim(bytes32[] calldata escrowIds, address recipient) external;

    /**
     * @notice Batch withdraw from multiple escrows (only callable by prover after verification)
     * @dev Prover contract verifies conditions before calling
     * @param escrowIds Array of escrow identifiers
     * @param depositor Address of the depositor whose funds to withdraw
     * @param recipient Address to receive all funds
     */
    function batchWithdraw(bytes32[] calldata escrowIds, address depositor, address recipient) external;

    /**
     * @notice Set the prover contract address (only owner)
     * @param _proverContract New prover contract address
     */
    function setProverContract(address _proverContract) external;

    /**
     * @notice Collect accumulated protocol fees for a single token (only owner)
     * @param token ERC20 token address to collect fees for
     */
    function collect(address token) external;

    /**
     * @notice Collect accumulated protocol fees for multiple tokens (only owner)
     * @param tokens Array of ERC20 token addresses to collect fees for
     */
    function batchCollect(address[] calldata tokens) external;

    /**
     * @notice Get escrow details
     * @param escrowId Escrow identifier
     * @return Escrow data
     */
    function getEscrow(bytes32 escrowId) external view returns (Escrow memory);

    /**
     * @notice Get depositor's deposit amount for an escrow
     * @param escrowId Escrow identifier
     * @param depositor Depositor address
     * @return Amount deposited by the depositor
     */
    function getAmount(bytes32 escrowId, address depositor) external view returns (uint96);

    /**
     * @notice Get the current prover contract address
     * @return Prover contract address
     */
    function proverContract() external view returns (address);
}
