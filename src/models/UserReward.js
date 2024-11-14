import { pool } from '../db.js';

export class UserReward {
  static async create({ userId, prizeType, prizeAmount }) {
    const query = `
      INSERT INTO user_rewards (user_id, prize_type, prize_amount, status)
      VALUES ($1, $2, $3, 'awarded')
      RETURNING *
    `;
    const { rows } = await pool.query(query, [userId, prizeType, prizeAmount]);
    return rows[0];
  }

  static async findByUserId(userId) {
    const query = `
      SELECT id, prize_type, prize_amount, status, created_at
      FROM user_rewards
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows;
  }
}