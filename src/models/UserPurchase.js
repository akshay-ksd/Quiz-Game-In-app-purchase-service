import { pool } from '../db.js';

export class UserPurchase {
  static async create({ userId, itemId, amount, transactionId }) {
    const query = `
      INSERT INTO user_purchases (user_id, item_id, amount, status, transaction_id)
      VALUES ($1, $2, $3, 'pending', $4)
      RETURNING *
    `;
    const { rows } = await pool.query(query, [userId, itemId, amount, transactionId]);
    return rows[0];
  }

  static async findByTransactionId(transactionId) {
    const query = `
      SELECT up.*, pi.item_type, pi.price
      FROM user_purchases up
      JOIN purchase_items pi ON up.item_id = pi.id
      WHERE up.transaction_id = $1
    `;
    const { rows } = await pool.query(query, [transactionId]);
    return rows[0];
  }

  static async findByUserId(userId) {
    const query = `
      SELECT 
        up.id,
        up.purchase_date,
        up.amount,
        up.status,
        up.transaction_id,
        pi.item_name,
        pi.item_type,
        pi.price as item_price,
        pi.description
      FROM user_purchases up
      JOIN purchase_items pi ON up.item_id = pi.id
      WHERE up.user_id = $1
      ORDER BY up.purchase_date DESC
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows;
  }

  static async updateStatus(transactionId, status) {
    const query = `
      UPDATE user_purchases
      SET status = $1
      WHERE transaction_id = $2
      RETURNING *
    `;
    const { rows } = await pool.query(query, [status, transactionId]);
    return rows[0];
  }
}