import { pool } from '../db.js';

export class UserAccount {
  static async findByUserId(userId) {
    const query = `
      SELECT * FROM user_accounts 
      WHERE user_id = $1
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows[0];
  }

  static async updateBalance(userId, itemType, amount) {
    const query = `
      INSERT INTO user_accounts (user_id, ${itemType}, last_update)
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        ${itemType} = user_accounts.${itemType} + $2,
        last_update = CURRENT_TIMESTAMP
      RETURNING *
    `;
    const { rows } = await pool.query(query, [userId, amount]);
    return rows[0];
  }
}