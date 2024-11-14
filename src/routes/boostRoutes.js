import express from 'express';
import { UserBoost } from '../models/UserBoost.js';
import { ActiveBoost } from '../models/ActiveBoost.js';

const router = express.Router();

router.get('/user/boosts/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const boosts = await UserBoost.findAllByUserId(userId);
    
    if (boosts.length === 0) {
      return res.status(404).json({ message: 'No boosts available for this user' });
    }

    res.json({ boosts });
  } catch (error) {
    console.error('Error fetching user boosts:', error);
    res.status(500).json({ error: 'Failed to fetch user boosts' });
  }
});

router.post('/user/boosts/redeem', async (req, res) => {
  const { user_id, boost_id } = req.body;

  try {
    if (!user_id || !boost_id) {
      return res.status(400).json({ error: 'User ID and Boost ID are required' });
    }

    const userBoost = await UserBoost.findByUserAndBoostId(user_id, boost_id);
    if (!userBoost || userBoost.quantity < 1) {
      return res.status(400).json({ error: 'Insufficient boosts in inventory' });
    }

    const updatedBoost = await UserBoost.deductBoost(user_id, boost_id);
    if (!updatedBoost) {
      return res.status(400).json({ error: 'Failed to deduct boost' });
    }

    const activeBoost = await ActiveBoost.create(user_id, boost_id);

    res.json({
      message: 'Boost redeemed successfully',
      boost: {
        name: userBoost.name,
        effect: userBoost.effect,
        remaining_quantity: updatedBoost.quantity,
        activation_time: activeBoost.activation_time
      }
    });

  } catch (error) {
    console.error('Error redeeming boost:', error);
    res.status(500).json({ error: 'Failed to redeem boost' });
  }
});

router.get('/user/boosts/active/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const activeBoosts = await ActiveBoost.findActiveBoosts(userId);
    res.json({ active_boosts: activeBoosts });
  } catch (error) {
    console.error('Error fetching active boosts:', error);
    res.status(500).json({ error: 'Failed to fetch active boosts' });
  }
});

export default router;