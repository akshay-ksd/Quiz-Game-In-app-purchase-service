import express from 'express';
import { TransactionLog } from '../models/TransactionLog.js';

const router = express.Router();

router.get('/transaction-log/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const transactions = await TransactionLog.findByUserId(userId);
    
    if (transactions.length === 0) {
      return res.status(404).json({ message: 'No transactions found for this user' });
    }

    res.json({ transactions });
  } catch (error) {
    console.error('Error fetching transaction log:', error);
    res.status(500).json({ error: 'Failed to fetch transaction log' });
  }
});

router.post('/transaction-log', async (req, res) => {
  const { userId, transactionType, amount, status, description } = req.body;

  try {
    // Validate required fields
    if (!userId || !transactionType || !amount || !status) {
      return res.status(400).json({ 
        error: 'Missing required fields. userId, transactionType, amount, and status are required' 
      });
    }

    // Validate amount is a positive number
    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }

    // Create transaction log entry
    const transaction = await TransactionLog.create({
      userId,
      transactionType,
      amount,
      status,
      description: description || null
    });

    res.status(201).json({
      message: 'Transaction logged successfully',
      transaction
    });
  } catch (error) {
    console.error('Error creating transaction log:', error);
    res.status(500).json({ error: 'Failed to create transaction log' });
  }
});

export default router;