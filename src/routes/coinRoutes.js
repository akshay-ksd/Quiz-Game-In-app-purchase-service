import express from 'express';
import { UserAccount } from '../models/UserAccount.js';
import { CoinTransaction } from '../models/CoinTransaction.js';

const router = express.Router();

router.get('/user/coins/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const userAccount = await UserAccount.findByUserId(userId);
    if (!userAccount) {
      return res.status(404).json({ error: 'User account not found' });
    }

    res.json({ 
      coin_balance: userAccount.coins,
      last_updated: userAccount.last_update
    });
  } catch (error) {
    console.error('Error fetching coin balance:', error);
    res.status(500).json({ error: 'Failed to fetch coin balance' });
  }
});

router.post('/coins/add', async (req, res) => {
  const { userId, coinsToAdd } = req.body;

  try {
    if (!userId || !coinsToAdd || coinsToAdd <= 0) {
      return res.status(400).json({ 
        error: 'Invalid input. Please provide a valid userId and coinsToAdd value' 
      });
    }

    const userAccount = await UserAccount.findByUserId(userId);
    if (!userAccount) {
      return res.status(404).json({ error: 'User account not found' });
    }

    const updatedAccount = await UserAccount.updateBalance(
      userId,
      'coins',
      coinsToAdd
    );

    await CoinTransaction.create({
      userId,
      coins: coinsToAdd,
      transactionType: 'ADMIN_ADD'
    });

    res.json({
      message: 'Coins added successfully',
      new_balance: updatedAccount.coins
    });

  } catch (error) {
    console.error('Error adding coins:', error);
    res.status(500).json({ error: 'Failed to add coins' });
  }
});

router.post('/coins/deduct', async (req, res) => {
  const { userId, coinsToDeduct } = req.body;

  try {
    if (!userId || !coinsToDeduct || coinsToDeduct <= 0) {
      return res.status(400).json({ 
        error: 'Invalid input. Please provide a valid userId and coinsToDeduct value' 
      });
    }

    const userAccount = await UserAccount.findByUserId(userId);
    if (!userAccount) {
      return res.status(404).json({ error: 'User account not found' });
    }

    if (userAccount.coins < coinsToDeduct) {
      return res.status(400).json({ error: 'Insufficient coins' });
    }

    const updatedAccount = await UserAccount.updateBalance(
      userId,
      'coins',
      -coinsToDeduct
    );

    await CoinTransaction.create({
      userId,
      coins: -coinsToDeduct,
      transactionType: 'DEDUCT'
    });

    res.json({
      message: 'Coins deducted successfully',
      new_balance: updatedAccount.coins
    });

  } catch (error) {
    console.error('Error deducting coins:', error);
    res.status(500).json({ error: 'Failed to deduct coins' });
  }
});

router.get('/coins/transactions/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const transactions = await CoinTransaction.findByUserId(userId);
    
    if (transactions.length === 0) {
      return res.status(404).json({ message: 'No coin transactions found for this user' });
    }

    res.json({ transactions });
  } catch (error) {
    console.error('Error fetching coin transactions:', error);
    res.status(500).json({ error: 'Failed to fetch coin transactions' });
  }
});

export default router;