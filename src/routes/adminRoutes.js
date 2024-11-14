import express from 'express';
import { Voucher } from '../models/Voucher.js';
import { UserReward } from '../models/UserReward.js';
import { UserAccount } from '../models/UserAccount.js';
import { TransactionLog } from '../models/TransactionLog.js';
import { VoucherRedemption } from '../models/VoucherRedemption.js';

const router = express.Router();

// Generate a unique voucher code
const generateVoucherCode = () => {
  const prefix = 'PRIZE';
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

router.post('/admin/update-voucher/:voucherId', async (req, res) => {
  const { voucherId } = req.params;
  const { value, coinCost, status } = req.body;

  try {
    // Validate required fields
    if (!value || !coinCost || !status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate status value
    const validStatuses = ['active', 'inactive', 'expired'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    // Update voucher
    const updatedVoucher = await Voucher.update(voucherId, {
      value,
      coinCost,
      status
    });

    if (!updatedVoucher) {
      return res.status(404).json({ error: 'Voucher not found' });
    }

    res.json({
      message: 'Voucher updated successfully',
      voucher: updatedVoucher
    });

  } catch (error) {
    console.error('Error updating voucher:', error);
    res.status(500).json({ error: 'Failed to update voucher' });
  }
});

router.post('/admin/approve-winner', async (req, res) => {
  const { userId, prizeType, prizeAmount } = req.body;

  try {
    // Validate required fields
    if (!userId || !prizeType || !prizeAmount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate prize type
    const validPrizeTypes = ['coins', 'voucher'];
    if (!validPrizeTypes.includes(prizeType)) {
      return res.status(400).json({ error: 'Invalid prize type' });
    }

    // Validate prize amount
    if (prizeAmount <= 0) {
      return res.status(400).json({ error: 'Prize amount must be greater than 0' });
    }

    // Get user account
    const userAccount = await UserAccount.findByUserId(userId);
    if (!userAccount) {
      return res.status(404).json({ error: 'User account not found' });
    }

    // Process prize based on type
    if (prizeType === 'coins') {
      // Update user's coin balance
      const updatedAccount = await UserAccount.updateBalance(
        userId,
        'coins',
        prizeAmount
      );

      // Create transaction log
      await TransactionLog.create({
        userId,
        transactionType: 'PRIZE_AWARD',
        amount: prizeAmount,
        status: 'completed',
        description: `Prize award of ${prizeAmount} coins`
      });

      // Create reward record
      await UserReward.create({
        userId,
        prizeType,
        prizeAmount
      });

      res.json({
        message: 'Winner approved and coins awarded successfully',
        prize_type: prizeType,
        prize_amount: prizeAmount,
        new_balance: updatedAccount.coins
      });

    } else if (prizeType === 'voucher') {
      // Get voucher details
      const voucher = await Voucher.findById(prizeAmount);
      if (!voucher) {
        return res.status(404).json({ error: 'Voucher not found' });
      }

      // Generate voucher code
      const voucherCode = generateVoucherCode();

      // Create voucher redemption
      await VoucherRedemption.create({
        userId,
        voucherId: prizeAmount,
        voucherCode
      });

      // Create transaction log
      await TransactionLog.create({
        userId,
        transactionType: 'PRIZE_AWARD',
        amount: voucher.coin_cost,
        status: 'completed',
        description: `Prize award of voucher: ${voucher.name}`
      });

      // Create reward record
      await UserReward.create({
        userId,
        prizeType,
        prizeAmount
      });

      res.json({
        message: 'Winner approved and voucher awarded successfully',
        prize_type: prizeType,
        voucher_name: voucher.name,
        voucher_code: voucherCode
      });
    }

  } catch (error) {
    console.error('Error approving winner:', error);
    res.status(500).json({ error: 'Failed to approve winner' });
  }
});

export default router;