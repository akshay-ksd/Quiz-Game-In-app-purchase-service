import express from 'express';
import { PurchaseItem } from '../models/PurchaseItem.js';
import { UserPurchase } from '../models/UserPurchase.js';
import { UserAccount } from '../models/UserAccount.js';

const router = express.Router();

router.get('/in-app-purchases', async (req, res) => {
  try {
    const items = await PurchaseItem.findAll();
    res.json(items);
  } catch (error) {
    console.error('Error fetching in-app purchases:', error);
    res.status(500).json({ error: 'Failed to retrieve in-app purchase items' });
  }
});

router.get('/in-app-purchases/:id', async (req, res) => {
  try {
    const item = await PurchaseItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Purchase item not found' });
    }
    res.json(item);
  } catch (error) {
    console.error('Error fetching purchase item:', error);
    res.status(500).json({ error: 'Failed to retrieve purchase item' });
  }
});

router.get('/user-purchases/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const purchases = await UserPurchase.findByUserId(userId);
    
    if (purchases.length === 0) {
      return res.status(404).json({ message: 'No purchases found for this user' });
    }

    res.json({ purchase_history: purchases });
  } catch (error) {
    console.error('Error fetching user purchases:', error);
    res.status(500).json({ error: 'Failed to retrieve user purchases' });
  }
});

router.post('/purchase', async (req, res) => {
  const { userId, itemId, paymentInfo } = req.body;

  try {
    // Validate required fields
    if (!userId || !itemId || !paymentInfo?.transactionId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if transaction already exists
    const existingPurchase = await UserPurchase.findByTransactionId(paymentInfo.transactionId);
    if (existingPurchase) {
      return res.status(400).json({ error: 'Transaction already processed' });
    }

    // Get item details
    const item = await PurchaseItem.findById(itemId);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Create pending purchase
    const purchase = await UserPurchase.create({
      userId,
      itemId,
      amount: item.price,
      transactionId: paymentInfo.transactionId
    });

    res.status(201).json({
      message: 'Purchase initiated',
      purchase
    });

  } catch (error) {
    console.error('Error processing purchase:', error);
    res.status(500).json({ error: 'Failed to process purchase' });
  }
});

router.post('/purchase/verify', async (req, res) => {
  const { transactionId, paymentStatus } = req.body;

  try {
    // Validate required fields
    if (!transactionId || !paymentStatus) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get purchase transaction
    const purchase = await UserPurchase.findByTransactionId(transactionId);
    if (!purchase) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Check if transaction is already completed
    if (purchase.status === 'completed') {
      return res.status(400).json({ error: 'Transaction already completed' });
    }

    if (paymentStatus === 'success') {
      // Update transaction status
      const updatedPurchase = await UserPurchase.updateStatus(transactionId, 'completed');

      // Calculate item amount based on type
      const itemAmount = purchase.item_type === 'coins' ? 
        parseInt(purchase.price * 100) : 1;

      // Update user account
      const updatedAccount = await UserAccount.updateBalance(
        purchase.user_id,
        purchase.item_type,
        itemAmount
      );

      res.json({
        message: 'Purchase verified successfully',
        purchase: updatedPurchase,
        account: updatedAccount
      });
    } else {
      // Mark transaction as failed
      const updatedPurchase = await UserPurchase.updateStatus(transactionId, 'failed');
      res.status(400).json({
        message: 'Payment verification failed',
        purchase: updatedPurchase
      });
    }
  } catch (error) {
    console.error('Error verifying purchase:', error);
    res.status(500).json({ error: 'Failed to verify purchase' });
  }
});

export default router;