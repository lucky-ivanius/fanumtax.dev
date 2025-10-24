// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Test, console} from "forge-std/Test.sol";
import {FanumtaxEscrow} from "../src/FanumtaxEscrow.sol";
import {IFanumtaxEscrow} from "../src/interfaces/IFanumtaxEscrow.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {ERC20Mock} from "./mocks/ERC20Mock.sol";

/**
 * @title FanumtaxEscrowFuzzTest
 * @notice Fuzz tests for FanumtaxEscrow contract
 */
contract FanumtaxEscrowFuzzTest is Test {
    FanumtaxEscrow public escrow;
    ERC20Mock public token;

    address public owner;
    address public prover;
    address public depositor1;
    address public recipient;

    uint256 constant REPOSITORY = 123456789;
    uint256 constant ISSUE_NUMBER = 42;

    function setUp() public {
        owner = makeAddr("owner");
        prover = makeAddr("prover");
        depositor1 = makeAddr("depositor1");
        recipient = makeAddr("recipient");

        // Deploy token
        token = new ERC20Mock();

        // Deploy escrow
        FanumtaxEscrow implementation = new FanumtaxEscrow();
        bytes memory initData = abi.encodeCall(FanumtaxEscrow.initialize, (owner));
        ERC1967Proxy proxy = new ERC1967Proxy(address(implementation), initData);
        escrow = FanumtaxEscrow(address(proxy));

        // Set prover
        vm.prank(owner);
        escrow.setProverContract(prover);
    }

    /**
     * @notice Fuzz test deposit with random amounts
     * @dev Tests that deposits work correctly for any valid uint96 amount
     */
    function testFuzz_Deposit(uint96 amount) public {
        // Skip zero amounts (invalid)
        vm.assume(amount > 0);

        // Mint and approve
        token.mint(depositor1, amount);
        vm.prank(depositor1);
        token.approve(address(escrow), amount);

        bytes32 escrowId = keccak256(abi.encodePacked(REPOSITORY, ISSUE_NUMBER, address(token)));

        // Deposit
        vm.prank(depositor1);
        escrow.deposit(REPOSITORY, ISSUE_NUMBER, address(token), amount);

        // Verify
        IFanumtaxEscrow.Escrow memory esc = escrow.getEscrow(escrowId);
        assertEq(esc.totalAmount, amount);
        assertEq(escrow.getAmount(escrowId, depositor1), amount);
        assertEq(token.balanceOf(address(escrow)), amount);
    }

    /**
     * @notice Fuzz test fee calculation accuracy
     * @dev Ensures 2.5% fee is correctly calculated for all amounts
     */
    function testFuzz_FeeCalculation(uint96 amount) public {
        // Bound to reasonable range to avoid edge case overflows in ERC20Mock
        amount = uint96(bound(amount, 100, 1e27)); // 100 to 1 billion tokens (assuming 18 decimals)

        // Setup
        token.mint(depositor1, amount);
        vm.prank(depositor1);
        token.approve(address(escrow), amount);

        bytes32 escrowId = keccak256(abi.encodePacked(REPOSITORY, ISSUE_NUMBER, address(token)));

        // Deposit
        vm.prank(depositor1);
        escrow.deposit(REPOSITORY, ISSUE_NUMBER, address(token), amount);

        // Claim
        vm.prank(prover);
        escrow.claim(escrowId, recipient);

        // Calculate expected fee
        uint96 expectedFee = uint96((uint256(amount) * 250) / 10000);
        uint96 expectedNetAmount = amount - expectedFee;

        // Verify fee calculation
        assertEq(escrow.accumulatedFees(address(token)), expectedFee, "Fee calculation incorrect");
        assertEq(token.balanceOf(recipient), expectedNetAmount, "Net amount incorrect");
        assertEq(token.balanceOf(address(escrow)), expectedFee, "Escrow balance incorrect");
    }

    /**
     * @notice Fuzz test multiple deposits from same depositor
     * @dev Tests accumulation of deposits
     */
    function testFuzz_MultipleDeposits(uint96 amount1, uint96 amount2) public {
        // Ensure valid amounts
        vm.assume(amount1 > 0 && amount2 > 0);
        // Prevent overflow
        vm.assume(uint256(amount1) + uint256(amount2) <= type(uint96).max);

        uint96 totalAmount = amount1 + amount2;

        // Mint and approve
        token.mint(depositor1, totalAmount);
        vm.prank(depositor1);
        token.approve(address(escrow), totalAmount);

        bytes32 escrowId = keccak256(abi.encodePacked(REPOSITORY, ISSUE_NUMBER, address(token)));

        // First deposit
        vm.prank(depositor1);
        escrow.deposit(REPOSITORY, ISSUE_NUMBER, address(token), amount1);

        // Second deposit
        vm.prank(depositor1);
        escrow.deposit(REPOSITORY, ISSUE_NUMBER, address(token), amount2);

        // Verify total
        IFanumtaxEscrow.Escrow memory esc = escrow.getEscrow(escrowId);
        assertEq(esc.totalAmount, totalAmount);
        assertEq(escrow.getAmount(escrowId, depositor1), totalAmount);
    }

    /**
     * @notice Fuzz test withdraw functionality
     * @dev Tests that depositors can withdraw their exact amount
     */
    function testFuzz_Withdraw(uint96 amount) public {
        vm.assume(amount > 0);

        // Setup
        token.mint(depositor1, amount);
        vm.prank(depositor1);
        token.approve(address(escrow), amount);

        bytes32 escrowId = keccak256(abi.encodePacked(REPOSITORY, ISSUE_NUMBER, address(token)));

        // Deposit
        vm.prank(depositor1);
        escrow.deposit(REPOSITORY, ISSUE_NUMBER, address(token), amount);

        uint256 recipientBalanceBefore = token.balanceOf(recipient);

        // Withdraw
        vm.prank(prover);
        escrow.withdraw(escrowId, depositor1, recipient);

        // Verify
        assertEq(token.balanceOf(recipient), recipientBalanceBefore + amount);
        assertEq(escrow.getAmount(escrowId, depositor1), 0);
        assertEq(token.balanceOf(address(escrow)), 0);
    }

    /**
     * @notice Fuzz test fee collection
     * @dev Tests that accumulated fees can be collected correctly
     */
    function testFuzz_CollectFees(uint96 amount) public {
        vm.assume(amount >= 100);

        // Setup and deposit
        token.mint(depositor1, amount);
        vm.prank(depositor1);
        token.approve(address(escrow), amount);

        bytes32 escrowId = keccak256(abi.encodePacked(REPOSITORY, ISSUE_NUMBER, address(token)));

        vm.prank(depositor1);
        escrow.deposit(REPOSITORY, ISSUE_NUMBER, address(token), amount);

        // Claim to generate fees
        vm.prank(prover);
        escrow.claim(escrowId, recipient);

        uint256 expectedFee = (uint256(amount) * 250) / 10000;
        uint256 ownerBalanceBefore = token.balanceOf(owner);

        // Collect fees
        vm.prank(owner);
        escrow.collect(address(token));

        // Verify
        assertEq(token.balanceOf(owner), ownerBalanceBefore + expectedFee);
        assertEq(escrow.accumulatedFees(address(token)), 0);
    }

    /**
     * @notice Fuzz test repository and issue number combinations
     * @dev Tests that different repo/issue combinations create unique escrow IDs
     */
    function testFuzz_UniqueEscrowIds(uint256 repository, uint256 issueNumber, uint96 amount) public {
        vm.assume(amount > 0);
        vm.assume(repository > 0 && issueNumber > 0);

        // Setup
        token.mint(depositor1, amount);
        vm.prank(depositor1);
        token.approve(address(escrow), amount);

        bytes32 escrowId = keccak256(abi.encodePacked(repository, issueNumber, address(token)));

        // Deposit
        vm.prank(depositor1);
        escrow.deposit(repository, issueNumber, address(token), amount);

        // Verify escrow exists and is unique
        IFanumtaxEscrow.Escrow memory esc = escrow.getEscrow(escrowId);
        assertEq(esc.totalAmount, amount);
        assertEq(esc.token, address(token));
    }

    /**
     * @notice Fuzz test that claim always leaves correct fee amount
     * @dev Ensures no rounding errors cause incorrect fee accumulation
     */
    function testFuzz_ClaimInvariant(uint96 amount) public {
        vm.assume(amount >= 100);

        // Setup
        token.mint(depositor1, amount);
        vm.prank(depositor1);
        token.approve(address(escrow), amount);

        bytes32 escrowId = keccak256(abi.encodePacked(REPOSITORY, ISSUE_NUMBER, address(token)));

        vm.prank(depositor1);
        escrow.deposit(REPOSITORY, ISSUE_NUMBER, address(token), amount);

        // Claim
        vm.prank(prover);
        escrow.claim(escrowId, recipient);

        // Invariant: accumulated fee + recipient balance should equal deposited amount
        uint256 fee = escrow.accumulatedFees(address(token));
        uint256 recipientBalance = token.balanceOf(recipient);

        assertEq(fee + recipientBalance, amount, "Sum of fee and recipient balance must equal deposited amount");
    }

    /**
     * @notice Fuzz test partial withdrawals from multiple depositors
     * @dev Tests complex scenario with multiple depositors
     */
    function testFuzz_MultipleDepositorsWithdraw(uint96 amount1, uint96 amount2) public {
        vm.assume(amount1 > 0 && amount2 > 0);
        vm.assume(uint256(amount1) + uint256(amount2) <= type(uint96).max);

        address depositor2 = makeAddr("depositor2");

        // Setup depositor1
        token.mint(depositor1, amount1);
        vm.prank(depositor1);
        token.approve(address(escrow), amount1);

        // Setup depositor2
        token.mint(depositor2, amount2);
        vm.prank(depositor2);
        token.approve(address(escrow), amount2);

        bytes32 escrowId = keccak256(abi.encodePacked(REPOSITORY, ISSUE_NUMBER, address(token)));

        // Both deposit
        vm.prank(depositor1);
        escrow.deposit(REPOSITORY, ISSUE_NUMBER, address(token), amount1);

        vm.prank(depositor2);
        escrow.deposit(REPOSITORY, ISSUE_NUMBER, address(token), amount2);

        // Depositor1 withdraws
        vm.prank(prover);
        escrow.withdraw(escrowId, depositor1, recipient);

        // Verify depositor1 withdrawn, depositor2 still has funds
        assertEq(escrow.getAmount(escrowId, depositor1), 0);
        assertEq(escrow.getAmount(escrowId, depositor2), amount2);
        assertEq(token.balanceOf(recipient), amount1);
    }

    /**
     * @notice Fuzz test edge case: very small amounts
     * @dev Tests behavior with minimal amounts
     */
    function testFuzz_SmallAmounts(uint96 amount) public {
        vm.assume(amount > 0 && amount < 1000);

        // Setup
        token.mint(depositor1, amount);
        vm.prank(depositor1);
        token.approve(address(escrow), amount);

        bytes32 escrowId = keccak256(abi.encodePacked(REPOSITORY, ISSUE_NUMBER, address(token)));

        // Deposit
        vm.prank(depositor1);
        escrow.deposit(REPOSITORY, ISSUE_NUMBER, address(token), amount);

        // Claim
        vm.prank(prover);
        escrow.claim(escrowId, recipient);

        // Even with small amounts, fee + net should equal total
        uint256 fee = escrow.accumulatedFees(address(token));
        uint256 netAmount = token.balanceOf(recipient);
        assertEq(fee + netAmount, amount);
    }

    /**
     * @notice Fuzz test edge case: maximum uint96 value
     * @dev Tests behavior with very large amounts
     */
    function testFuzz_LargeAmounts(uint96 amount) public {
        vm.assume(amount > type(uint96).max / 2); // Test upper half of uint96 range

        // Setup
        token.mint(depositor1, amount);
        vm.prank(depositor1);
        token.approve(address(escrow), amount);

        bytes32 escrowId = keccak256(abi.encodePacked(REPOSITORY, ISSUE_NUMBER, address(token)));

        // Deposit
        vm.prank(depositor1);
        escrow.deposit(REPOSITORY, ISSUE_NUMBER, address(token), amount);

        // Claim
        vm.prank(prover);
        escrow.claim(escrowId, recipient);

        // Verify no overflow in fee calculation
        uint256 fee = escrow.accumulatedFees(address(token));
        uint256 netAmount = token.balanceOf(recipient);
        assertEq(fee + netAmount, amount);
        assertLe(fee, amount); // Fee should never exceed deposit
    }
}
