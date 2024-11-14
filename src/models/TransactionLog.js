import { pool } from '../db.js';

export class TransactionLog {
  static async create({ userId, transactionType, amount, status, description }) {
    const query = `
      INSERT INTO transaction_log (
        user_id, 
        transaction_type, 
        amount, 
        status, 
        description,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING 
        id,
        transaction_type,
        amount,
        status,
        description,
        created_at,
        updated_at
    `;
    const { rows } = await pool.query(query, [
      userId,
      transactionType,
      amount,
      status,
      description
    ]);
    return rows[0];
  }

  static async findByUserId(userId) {
    const query = `
      SELECT 
        id,
        transaction_type,
        amount,
        status,
        description,
        created_at,
        updated_at
      FROM transaction_log 
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows;
  }
}