import { pool } from '../db.js';

export class CoinTransaction {
  static async create({ userId, coins, transactionType }) {
    const query = `
      INSERT INTO coin_transactions (user_id, coins_added, transaction_type)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const { rows } = await pool.query(query, [userId, coins, transactionType]);
    return rows[0];
  }

  static async findByUserId(userId) {
    const query = `
      SELECT id, coins_added, transaction_type, created_at
      FROM coin_transactions
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows;
  }
}