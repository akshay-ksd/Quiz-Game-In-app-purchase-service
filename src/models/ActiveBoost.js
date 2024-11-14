import { pool } from '../db.js';

export class ActiveBoost {
  static async create(userId, boostId) {
    const query = `
      INSERT INTO active_boosts (user_id, boost_id, activation_time)
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      RETURNING *
    `;
    const { rows } = await pool.query(query, [userId, boostId]);
    return rows[0];
  }

  static async findActiveBoosts(userId) {
    const query = `
      SELECT ab.*, bi.name, bi.effect
      FROM active_boosts ab
      JOIN boost_items bi ON ab.boost_id = bi.id
      WHERE ab.user_id = $1 AND ab.activation_time > NOW() - INTERVAL '24 hours'
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows;
  }
}