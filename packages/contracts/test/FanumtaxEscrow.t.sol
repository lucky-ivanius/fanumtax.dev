// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Test, console} from "forge-std/Test.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {FanumtaxEscrow} from "../src/FanumtaxEscrow.sol";
import {IFanumtaxEscrow} from "../src/interfaces/IFanumtaxEscrow.sol";
import {ERC20Mock} from "./mocks/ERC20Mock.sol";

contract FanumtaxEscrowTest is Test {
    FanumtaxEscrow public escrow;
    ERC20Mock public token;

    address public owner;
    address public prover;
    address public depositor1;
    address public depositor2;
    address public recipient;

    uint256 constant REPOSITORY = 123456789;
    uint256 constant ISSUE_NUMBER = 42;
    uint96 constant DEPOSIT_AMOUNT = 1000 ether;

    function setUp() public {
        owner = makeAddr("owner");
        prover = makeAddr("prover");
        depositor1 = makeAddr("depositor1");
        depositor2 = makeAddr("depositor2");
        recipient = makeAddr("recipient");

        // Deploy token
        token = new ERC20Mock();

        // Deploy implementation
        FanumtaxEscrow implementation = new FanumtaxEscrow();

        // Deploy proxy and initialize
        bytes memory initData = abi.encodeCall(FanumtaxEscrow.initialize, (owner));
        ERC1967Proxy proxy = new ERC1967Proxy(address(implementation), initData);
        escrow = FanumtaxEscrow(address(proxy));

        // Set prover contract
        vm.prank(owner);
        escrow.setProverContract(prover);

        // Mint tokens to depositors
        token.mint(depositor1, 10000 ether);
        token.mint(depositor2, 10000 ether);

        // Approve escrow
        vm.prank(depositor1);
        token.approve(address(escrow), type(uint256).max);

        vm.prank(depositor2);
        token.approve(address(escrow), type(uint256).max);
    }

    function testInitialization() public view {
        assertEq(escrow.owner(), owner);
        assertEq(escrow.proverContract(), prover);
    }

    function testDeposit() public {
        bytes32 escrowId = keccak256(abi.encodePacked(REPOSITORY, ISSUE_NUMBER, address(token)));

        vm.expectEmit(true, true, true, true);
        emit IFanumtaxEscrow.Deposited(escrowId, depositor1, address(token), DEPOSIT_AMOUNT, REPOSITORY, ISSUE_NUMBER);

        vm.prank(depositor1);
        escrow.deposit(REPOSITORY, ISSUE_NUMBER, address(token), DEPOSIT_AMOUNT);

        // Check escrow state
        IFanumtaxEscrow.Escrow memory esc = escrow.getEscrow(escrowId);
        assertEq(esc.totalAmount, DEPOSIT_AMOUNT);
        assertEq(esc.token, address(token));
        assertFalse(esc.claimed);

        // Check depositor amount
        assertEq(escrow.getAmount(escrowId, depositor1), DEPOSIT_AMOUNT);

        // Check token balance
        assertEq(token.balanceOf(address(escrow)), DEPOSIT_AMOUNT);
    }

    function testMultipleDeposits() public {
        bytes32 escrowId = keccak256(abi.encodePacked(REPOSITORY, ISSUE_NUMBER, address(token)));

        // First deposit
        vm.prank(depositor1);
        escrow.deposit(REPOSITORY, ISSUE_NUMBER, address(token), DEPOSIT_AMOUNT);

        // Second deposit from same depositor
        vm.prank(depositor1);
        escrow.deposit(REPOSITORY, ISSUE_NUMBER, address(token), DEPOSIT_AMOUNT);

        // Third deposit from different depositor
        vm.prank(depositor2);
        escrow.deposit(REPOSITORY, ISSUE_NUMBER, address(token), DEPOSIT_AMOUNT);

        // Check total amount
        IFanumtaxEscrow.Escrow memory esc = escrow.getEscrow(escrowId);
        assertEq(esc.totalAmount, DEPOSIT_AMOUNT * 3);

        // Check individual amounts
        assertEq(escrow.getAmount(escrowId, depositor1), DEPOSIT_AMOUNT * 2);
        assertEq(escrow.getAmount(escrowId, depositor2), DEPOSIT_AMOUNT);
    }

    function testDepositRevertsOnZeroAmount() public {
        vm.prank(depositor1);
        vm.expectRevert(IFanumtaxEscrow.InvalidAmount.selector);
        escrow.deposit(REPOSITORY, ISSUE_NUMBER, address(token), 0);
    }

    function testDepositRevertsOnZeroToken() public {
        vm.prank(depositor1);
        vm.expectRevert(IFanumtaxEscrow.InvalidToken.selector);
        escrow.deposit(REPOSITORY, ISSUE_NUMBER, address(0), DEPOSIT_AMOUNT);
    }

    function testClaim() public {
        bytes32 escrowId = keccak256(abi.encodePacked(REPOSITORY, ISSUE_NUMBER, address(token)));

        // Deposit
        vm.prank(depositor1);
        escrow.deposit(REPOSITORY, ISSUE_NUMBER, address(token), DEPOSIT_AMOUNT);

        // Calculate fee (2.5%)
        uint96 fee = uint96((uint256(DEPOSIT_AMOUNT) * 250) / 10000);
        uint96 netAmount = DEPOSIT_AMOUNT - fee;

        // Claim
        vm.expectEmit(true, true, false, true);
        emit IFanumtaxEscrow.Claimed(escrowId, recipient, netAmount, fee);

        vm.prank(prover);
        escrow.claim(escrowId, recipient);

        // Check escrow state
        IFanumtaxEscrow.Escrow memory esc = escrow.getEscrow(escrowId);
        assertTrue(esc.claimed);

        // Check recipient balance (receives 97.5%)
        assertEq(token.balanceOf(recipient), netAmount);

        // Check accumulated fees (2.5% stays in contract)
        assertEq(escrow.accumulatedFees(address(token)), fee);
        assertEq(token.balanceOf(address(escrow)), fee);
    }

    function testClaimRevertsWhenNotProver() public {
        bytes32 escrowId = keccak256(abi.encodePacked(REPOSITORY, ISSUE_NUMBER, address(token)));

        vm.prank(depositor1);
        escrow.deposit(REPOSITORY, ISSUE_NUMBER, address(token), DEPOSIT_AMOUNT);

        vm.prank(depositor1);
        vm.expectRevert(IFanumtaxEscrow.Unauthorized.selector);
        escrow.claim(escrowId, recipient);
    }

    function testClaimRevertsWhenAlreadyClaimed() public {
        bytes32 escrowId = keccak256(abi.encodePacked(REPOSITORY, ISSUE_NUMBER, address(token)));

        vm.prank(depositor1);
        escrow.deposit(REPOSITORY, ISSUE_NUMBER, address(token), DEPOSIT_AMOUNT);

        vm.prank(prover);
        escrow.claim(escrowId, recipient);

        // Try to claim again
        vm.prank(prover);
        vm.expectRevert(IFanumtaxEscrow.EscrowAlreadyClaimed.selector);
        escrow.claim(escrowId, recipient);
    }

    function testClaimRevertsWhenEscrowNotFound() public {
        bytes32 escrowId = keccak256(abi.encodePacked(REPOSITORY, ISSUE_NUMBER, address(token)));

        vm.prank(prover);
        vm.expectRevert(IFanumtaxEscrow.EscrowNotFound.selector);
        escrow.claim(escrowId, recipient);
    }

    function testWithdraw() public {
        bytes32 escrowId = keccak256(abi.encodePacked(REPOSITORY, ISSUE_NUMBER, address(token)));

        // Deposit
        vm.prank(depositor1);
        escrow.deposit(REPOSITORY, ISSUE_NUMBER, address(token), DEPOSIT_AMOUNT);

        // Withdraw (prover verifies and calls on behalf of depositor)
        vm.expectEmit(true, true, true, true);
        emit IFanumtaxEscrow.Withdrawn(escrowId, depositor1, recipient, DEPOSIT_AMOUNT);

        vm.prank(prover);
        escrow.withdraw(escrowId, depositor1, recipient);

        // Check escrow state
        IFanumtaxEscrow.Escrow memory esc = escrow.getEscrow(escrowId);
        assertEq(esc.totalAmount, 0);

        // Check depositor amount is reset
        assertEq(escrow.getAmount(escrowId, depositor1), 0);

        // Check recipient balance
        assertEq(token.balanceOf(recipient), DEPOSIT_AMOUNT);
        assertEq(token.balanceOf(address(escrow)), 0);
    }

    function testWithdrawMultipleDepositors() public {
        bytes32 escrowId = keccak256(abi.encodePacked(REPOSITORY, ISSUE_NUMBER, address(token)));

        // Multiple deposits
        vm.prank(depositor1);
        escrow.deposit(REPOSITORY, ISSUE_NUMBER, address(token), DEPOSIT_AMOUNT);

        vm.prank(depositor2);
        escrow.deposit(REPOSITORY, ISSUE_NUMBER, address(token), DEPOSIT_AMOUNT);

        // Depositor1 withdraws (via prover)
        vm.prank(prover);
        escrow.withdraw(escrowId, depositor1, recipient);

        // Check state
        IFanumtaxEscrow.Escrow memory esc = escrow.getEscrow(escrowId);
        assertEq(esc.totalAmount, DEPOSIT_AMOUNT); // Only depositor2's amount remains
        assertEq(escrow.getAmount(escrowId, depositor1), 0);
        assertEq(escrow.getAmount(escrowId, depositor2), DEPOSIT_AMOUNT);
    }

    function testWithdrawRevertsWhenAlreadyClaimed() public {
        bytes32 escrowId = keccak256(abi.encodePacked(REPOSITORY, ISSUE_NUMBER, address(token)));

        vm.prank(depositor1);
        escrow.deposit(REPOSITORY, ISSUE_NUMBER, address(token), DEPOSIT_AMOUNT);

        // Claim first
        vm.prank(prover);
        escrow.claim(escrowId, recipient);

        // Try to withdraw
        vm.prank(prover);
        vm.expectRevert(IFanumtaxEscrow.EscrowAlreadyClaimed.selector);
        escrow.withdraw(escrowId, depositor1, recipient);
    }

    function testWithdrawRevertsWhenNoDeposit() public {
        bytes32 escrowId = keccak256(abi.encodePacked(REPOSITORY, ISSUE_NUMBER, address(token)));

        vm.prank(depositor1);
        escrow.deposit(REPOSITORY, ISSUE_NUMBER, address(token), DEPOSIT_AMOUNT);

        // Try to withdraw as depositor2 (who didn't deposit)
        vm.prank(prover);
        vm.expectRevert(IFanumtaxEscrow.NoDepositFound.selector);
        escrow.withdraw(escrowId, depositor2, recipient);
    }

    function testWithdrawRevertsWhenNotProver() public {
        bytes32 escrowId = keccak256(abi.encodePacked(REPOSITORY, ISSUE_NUMBER, address(token)));

        vm.prank(depositor1);
        escrow.deposit(REPOSITORY, ISSUE_NUMBER, address(token), DEPOSIT_AMOUNT);

        // Try to withdraw as depositor (not prover)
        vm.prank(depositor1);
        vm.expectRevert(IFanumtaxEscrow.Unauthorized.selector);
        escrow.withdraw(escrowId, depositor1, recipient);
    }

    function testBatchWithdrawRevertsWhenNotProver() public {
        bytes32 escrowId = keccak256(abi.encodePacked(REPOSITORY, ISSUE_NUMBER, address(token)));

        vm.prank(depositor1);
        escrow.deposit(REPOSITORY, ISSUE_NUMBER, address(token), DEPOSIT_AMOUNT);

        bytes32[] memory escrowIds = new bytes32[](1);
        escrowIds[0] = escrowId;

        // Try to batch withdraw as depositor (not prover)
        vm.prank(depositor1);
        vm.expectRevert(IFanumtaxEscrow.Unauthorized.selector);
        escrow.batchWithdraw(escrowIds, depositor1, recipient);
    }

    function testSetProverContract() public {
        address newProver = makeAddr("newProver");

        vm.expectEmit(true, true, false, false);
        emit IFanumtaxEscrow.ProverContractUpdated(prover, newProver);

        vm.prank(owner);
        escrow.setProverContract(newProver);

        assertEq(escrow.proverContract(), newProver);
    }

    function testSetProverContractRevertsWhenNotOwner() public {
        address newProver = makeAddr("newProver");

        vm.prank(depositor1);
        vm.expectRevert();
        escrow.setProverContract(newProver);
    }

    function testSetProverContractRevertsOnZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert(IFanumtaxEscrow.InvalidProverContract.selector);
        escrow.setProverContract(address(0));
    }

    function testMultipleTokensForSameIssue() public {
        ERC20Mock token2 = new ERC20Mock();
        token2.mint(depositor1, 10000 ether);

        vm.prank(depositor1);
        token2.approve(address(escrow), type(uint256).max);

        bytes32 escrowId1 = keccak256(abi.encodePacked(REPOSITORY, ISSUE_NUMBER, address(token)));
        bytes32 escrowId2 = keccak256(abi.encodePacked(REPOSITORY, ISSUE_NUMBER, address(token2)));

        // Different escrow IDs
        assertTrue(escrowId1 != escrowId2);

        // Deposit to both
        vm.startPrank(depositor1);
        escrow.deposit(REPOSITORY, ISSUE_NUMBER, address(token), DEPOSIT_AMOUNT);
        escrow.deposit(REPOSITORY, ISSUE_NUMBER, address(token2), DEPOSIT_AMOUNT);
        vm.stopPrank();

        // Check both escrows exist separately
        IFanumtaxEscrow.Escrow memory esc1 = escrow.getEscrow(escrowId1);
        IFanumtaxEscrow.Escrow memory esc2 = escrow.getEscrow(escrowId2);

        assertEq(esc1.token, address(token));
        assertEq(esc2.token, address(token2));
        assertEq(esc1.totalAmount, DEPOSIT_AMOUNT);
        assertEq(esc2.totalAmount, DEPOSIT_AMOUNT);
    }

    function testUpgradeable() public {
        // Deploy new implementation
        FanumtaxEscrow newImplementation = new FanumtaxEscrow();

        // Upgrade (only owner can do this)
        vm.prank(owner);
        escrow.upgradeToAndCall(address(newImplementation), "");

        // Contract should still work after upgrade
        bytes32 escrowId = keccak256(abi.encodePacked(REPOSITORY, ISSUE_NUMBER, address(token)));

        vm.prank(depositor1);
        escrow.deposit(REPOSITORY, ISSUE_NUMBER, address(token), DEPOSIT_AMOUNT);

        IFanumtaxEscrow.Escrow memory esc = escrow.getEscrow(escrowId);
        assertEq(esc.totalAmount, DEPOSIT_AMOUNT);
    }

    function testUpgradeRevertsWhenNotOwner() public {
        FanumtaxEscrow newImplementation = new FanumtaxEscrow();

        vm.prank(depositor1);
        vm.expectRevert();
        escrow.upgradeToAndCall(address(newImplementation), "");
    }

    function testBatchClaim() public {
        // Create 3 tokens
        ERC20Mock token2 = new ERC20Mock();
        ERC20Mock token3 = new ERC20Mock();

        token2.mint(depositor1, 10000 ether);
        token3.mint(depositor1, 10000 ether);

        vm.startPrank(depositor1);
        token2.approve(address(escrow), type(uint256).max);
        token3.approve(address(escrow), type(uint256).max);
        vm.stopPrank();

        // Deposit to same issue with 3 different tokens
        vm.startPrank(depositor1);
        escrow.deposit(REPOSITORY, ISSUE_NUMBER, address(token), DEPOSIT_AMOUNT);
        escrow.deposit(REPOSITORY, ISSUE_NUMBER, address(token2), DEPOSIT_AMOUNT);
        escrow.deposit(REPOSITORY, ISSUE_NUMBER, address(token3), DEPOSIT_AMOUNT);
        vm.stopPrank();

        // Calculate escrow IDs
        bytes32 escrowId1 = keccak256(abi.encodePacked(REPOSITORY, ISSUE_NUMBER, address(token)));
        bytes32 escrowId2 = keccak256(abi.encodePacked(REPOSITORY, ISSUE_NUMBER, address(token2)));
        bytes32 escrowId3 = keccak256(abi.encodePacked(REPOSITORY, ISSUE_NUMBER, address(token3)));

        bytes32[] memory escrowIds = new bytes32[](3);
        escrowIds[0] = escrowId1;
        escrowIds[1] = escrowId2;
        escrowIds[2] = escrowId3;

        // Calculate fee (2.5%)
        uint96 fee = uint96((uint256(DEPOSIT_AMOUNT) * 250) / 10000);
        uint96 netAmount = DEPOSIT_AMOUNT - fee;

        // Batch claim all 3
        vm.prank(prover);
        escrow.batchClaim(escrowIds, recipient);

        // Verify all claimed
        assertTrue(escrow.getEscrow(escrowId1).claimed);
        assertTrue(escrow.getEscrow(escrowId2).claimed);
        assertTrue(escrow.getEscrow(escrowId3).claimed);

        // Verify recipient received all tokens (97.5% each)
        assertEq(token.balanceOf(recipient), netAmount);
        assertEq(token2.balanceOf(recipient), netAmount);
        assertEq(token3.balanceOf(recipient), netAmount);

        // Verify fees accumulated
        assertEq(escrow.accumulatedFees(address(token)), fee);
        assertEq(escrow.accumulatedFees(address(token2)), fee);
        assertEq(escrow.accumulatedFees(address(token3)), fee);
    }

    function testBatchClaimRevertsWhenNotProver() public {
        bytes32 escrowId = keccak256(abi.encodePacked(REPOSITORY, ISSUE_NUMBER, address(token)));

        vm.prank(depositor1);
        escrow.deposit(REPOSITORY, ISSUE_NUMBER, address(token), DEPOSIT_AMOUNT);

        bytes32[] memory escrowIds = new bytes32[](1);
        escrowIds[0] = escrowId;

        vm.prank(depositor1);
        vm.expectRevert(IFanumtaxEscrow.Unauthorized.selector);
        escrow.batchClaim(escrowIds, recipient);
    }

    function testBatchWithdraw() public {
        // Create 3 tokens
        ERC20Mock token2 = new ERC20Mock();
        ERC20Mock token3 = new ERC20Mock();

        token2.mint(depositor1, 10000 ether);
        token3.mint(depositor1, 10000 ether);

        vm.startPrank(depositor1);
        token2.approve(address(escrow), type(uint256).max);
        token3.approve(address(escrow), type(uint256).max);
        vm.stopPrank();

        // Deposit to same issue with 3 different tokens
        vm.startPrank(depositor1);
        escrow.deposit(REPOSITORY, ISSUE_NUMBER, address(token), DEPOSIT_AMOUNT);
        escrow.deposit(REPOSITORY, ISSUE_NUMBER, address(token2), DEPOSIT_AMOUNT);
        escrow.deposit(REPOSITORY, ISSUE_NUMBER, address(token3), DEPOSIT_AMOUNT);
        vm.stopPrank();

        // Calculate escrow IDs
        bytes32 escrowId1 = keccak256(abi.encodePacked(REPOSITORY, ISSUE_NUMBER, address(token)));
        bytes32 escrowId2 = keccak256(abi.encodePacked(REPOSITORY, ISSUE_NUMBER, address(token2)));
        bytes32 escrowId3 = keccak256(abi.encodePacked(REPOSITORY, ISSUE_NUMBER, address(token3)));

        bytes32[] memory escrowIds = new bytes32[](3);
        escrowIds[0] = escrowId1;
        escrowIds[1] = escrowId2;
        escrowIds[2] = escrowId3;

        // Batch withdraw all 3 (via prover)
        vm.prank(prover);
        escrow.batchWithdraw(escrowIds, depositor1, recipient);

        // Verify all withdrawn
        assertEq(escrow.getAmount(escrowId1, depositor1), 0);
        assertEq(escrow.getAmount(escrowId2, depositor1), 0);
        assertEq(escrow.getAmount(escrowId3, depositor1), 0);

        // Verify recipient received all tokens
        assertEq(token.balanceOf(recipient), DEPOSIT_AMOUNT);
        assertEq(token2.balanceOf(recipient), DEPOSIT_AMOUNT);
        assertEq(token3.balanceOf(recipient), DEPOSIT_AMOUNT);
    }

    function testBatchWithdrawRevertsWhenAlreadyClaimed() public {
        bytes32 escrowId = keccak256(abi.encodePacked(REPOSITORY, ISSUE_NUMBER, address(token)));

        vm.prank(depositor1);
        escrow.deposit(REPOSITORY, ISSUE_NUMBER, address(token), DEPOSIT_AMOUNT);

        // Claim first
        vm.prank(prover);
        escrow.claim(escrowId, recipient);

        bytes32[] memory escrowIds = new bytes32[](1);
        escrowIds[0] = escrowId;

        // Try to batch withdraw
        vm.prank(prover);
        vm.expectRevert(IFanumtaxEscrow.EscrowAlreadyClaimed.selector);
        escrow.batchWithdraw(escrowIds, depositor1, recipient);
    }

    function testCollect() public {
        bytes32 escrowId = keccak256(abi.encodePacked(REPOSITORY, ISSUE_NUMBER, address(token)));

        // Deposit and claim to accumulate fees
        vm.prank(depositor1);
        escrow.deposit(REPOSITORY, ISSUE_NUMBER, address(token), DEPOSIT_AMOUNT);

        uint96 fee = uint96((uint256(DEPOSIT_AMOUNT) * 250) / 10000);

        vm.prank(prover);
        escrow.claim(escrowId, recipient);

        // Verify fees accumulated
        assertEq(escrow.accumulatedFees(address(token)), fee);

        // Collect fees
        uint256 ownerBalanceBefore = token.balanceOf(owner);

        vm.expectEmit(true, true, false, true);
        emit IFanumtaxEscrow.FeesCollected(address(token), owner, fee);

        vm.prank(owner);
        escrow.collect(address(token));

        // Verify fees collected
        assertEq(escrow.accumulatedFees(address(token)), 0);
        assertEq(token.balanceOf(owner), ownerBalanceBefore + fee);
        assertEq(token.balanceOf(address(escrow)), 0);
    }

    function testCollectRevertsWhenNoFees() public {
        vm.prank(owner);
        vm.expectRevert(IFanumtaxEscrow.NoFeesToCollect.selector);
        escrow.collect(address(token));
    }

    function testCollectRevertsWhenNotOwner() public {
        bytes32 escrowId = keccak256(abi.encodePacked(REPOSITORY, ISSUE_NUMBER, address(token)));

        vm.prank(depositor1);
        escrow.deposit(REPOSITORY, ISSUE_NUMBER, address(token), DEPOSIT_AMOUNT);

        vm.prank(prover);
        escrow.claim(escrowId, recipient);

        // Try to collect as non-owner
        vm.prank(depositor1);
        vm.expectRevert();
        escrow.collect(address(token));
    }

    function testBatchCollect() public {
        // Create 3 tokens
        ERC20Mock token2 = new ERC20Mock();
        ERC20Mock token3 = new ERC20Mock();

        token2.mint(depositor1, 10000 ether);
        token3.mint(depositor1, 10000 ether);

        vm.startPrank(depositor1);
        token2.approve(address(escrow), type(uint256).max);
        token3.approve(address(escrow), type(uint256).max);
        vm.stopPrank();

        // Deposit to same issue with 3 different tokens
        vm.startPrank(depositor1);
        escrow.deposit(REPOSITORY, ISSUE_NUMBER, address(token), DEPOSIT_AMOUNT);
        escrow.deposit(REPOSITORY, ISSUE_NUMBER, address(token2), DEPOSIT_AMOUNT);
        escrow.deposit(REPOSITORY, ISSUE_NUMBER, address(token3), DEPOSIT_AMOUNT);
        vm.stopPrank();

        // Calculate escrow IDs and claim all
        bytes32 escrowId1 = keccak256(abi.encodePacked(REPOSITORY, ISSUE_NUMBER, address(token)));
        bytes32 escrowId2 = keccak256(abi.encodePacked(REPOSITORY, ISSUE_NUMBER, address(token2)));
        bytes32 escrowId3 = keccak256(abi.encodePacked(REPOSITORY, ISSUE_NUMBER, address(token3)));

        bytes32[] memory escrowIds = new bytes32[](3);
        escrowIds[0] = escrowId1;
        escrowIds[1] = escrowId2;
        escrowIds[2] = escrowId3;

        vm.prank(prover);
        escrow.batchClaim(escrowIds, recipient);

        uint96 fee = uint96((uint256(DEPOSIT_AMOUNT) * 250) / 10000);

        // Verify fees accumulated
        assertEq(escrow.accumulatedFees(address(token)), fee);
        assertEq(escrow.accumulatedFees(address(token2)), fee);
        assertEq(escrow.accumulatedFees(address(token3)), fee);

        // Batch collect fees
        address[] memory tokens = new address[](3);
        tokens[0] = address(token);
        tokens[1] = address(token2);
        tokens[2] = address(token3);

        uint256 ownerBalance1Before = token.balanceOf(owner);
        uint256 ownerBalance2Before = token2.balanceOf(owner);
        uint256 ownerBalance3Before = token3.balanceOf(owner);

        vm.prank(owner);
        escrow.batchCollect(tokens);

        // Verify all fees collected
        assertEq(escrow.accumulatedFees(address(token)), 0);
        assertEq(escrow.accumulatedFees(address(token2)), 0);
        assertEq(escrow.accumulatedFees(address(token3)), 0);

        assertEq(token.balanceOf(owner), ownerBalance1Before + fee);
        assertEq(token2.balanceOf(owner), ownerBalance2Before + fee);
        assertEq(token3.balanceOf(owner), ownerBalance3Before + fee);

        // All fees should be collected from escrow
        assertEq(token.balanceOf(address(escrow)), 0);
        assertEq(token2.balanceOf(address(escrow)), 0);
        assertEq(token3.balanceOf(address(escrow)), 0);
    }

    function testBatchCollectRevertsWhenNotOwner() public {
        bytes32 escrowId = keccak256(abi.encodePacked(REPOSITORY, ISSUE_NUMBER, address(token)));

        vm.prank(depositor1);
        escrow.deposit(REPOSITORY, ISSUE_NUMBER, address(token), DEPOSIT_AMOUNT);

        vm.prank(prover);
        escrow.claim(escrowId, recipient);

        address[] memory tokens = new address[](1);
        tokens[0] = address(token);

        // Try to batch collect as non-owner
        vm.prank(depositor1);
        vm.expectRevert();
        escrow.batchCollect(tokens);
    }
}
