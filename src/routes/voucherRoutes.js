import express from 'express';
import { Voucher } from '../models/Voucher.js';
import { VoucherRedemption } from '../models/VoucherRedemption.js';
import { UserAccount } from '../models/UserAccount.js';

const router = express.Router();

// Generate a unique voucher code
const generateVoucherCode = () => {
  const prefix = 'VOUCHER';
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

router.get('/vouchers', async (req, res) => {
  try {
    const vouchers = await Voucher.findAll();
    
    if (vouchers.length === 0) {
      return res.status(404).json({ message: 'No vouchers available for redemption' });
    }

    res.json({ vouchers });
  } catch (error) {
    console.error('Error fetching vouchers:', error);
    res.status(500).json({ error: 'Failed to fetch vouchers' });
  }
});

router.get('/user/voucher-redemptions/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const redemptions = await VoucherRedemption.findByUserId(userId);
    
    if (redemptions.length === 0) {
      return res.status(404).json({ message: 'No voucher redemptions found for this user' });
    }

    res.json({ redemptions });
  } catch (error) {
    console.error('Error fetching voucher redemptions:', error);
    res.status(500).json({ error: 'Failed to fetch voucher redemptions' });
  }
});

router.post('/voucher/redeem', async (req, res) => {
  const { userId, voucherId } = req.body;

  try {
    if (!userId || !voucherId) {
      return res.status(400).json({ error: 'User ID and Voucher ID are required' });
    }

    // Get voucher details
    const voucher = await Voucher.findById(voucherId);
    if (!voucher) {
      return res.status(404).json({ error: 'Voucher not found' });
    }

    // Get user's account
    const userAccount = await UserAccount.findByUserId(userId);
    if (!userAccount) {
      return res.status(404).json({ error: 'User account not found' });
    }

    // Check if user has enough coins
    if (userAccount.coins < voucher.coin_cost) {
      return res.status(400).json({ error: 'Insufficient coins' });
    }

    // Generate unique voucher code
    const voucherCode = generateVoucherCode();

    // Create redemption record
    await VoucherRedemption.create({
      userId,
      voucherId,
      voucherCode
    });

    // Update user's coin balance
    const updatedAccount = await UserAccount.updateBalance(
      userId,
      'coins',
      -voucher.coin_cost
    );

    res.json({
      message: 'Voucher redeemed successfully',
      voucher_code: voucherCode,
      voucher_name: voucher.name,
      remaining_coins: updatedAccount.coins
    });

  } catch (error) {
    console.error('Error redeeming voucher:', error);
    res.status(500).json({ error: 'Failed to redeem voucher' });
  }
});

export default router;