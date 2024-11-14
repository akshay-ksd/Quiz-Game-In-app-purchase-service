import { pool } from '../db.js';

export class UserBoost {
  static async findByUserAndBoostId(userId, boostId) {
    const query = `
      SELECT ub.*, bi.name, bi.description, bi.effect
      FROM user_boosts ub
      JOIN boost_items bi ON ub.boost_id = bi.id
      WHERE ub.user_id = $1 AND ub.boost_id = $2
    `;
    const { rows } = await pool.query(query, [userId, boostId]);
    return rows[0];
  }

  static async findAllByUserId(userId) {
    const query = `
      SELECT 
        ub.boost_id,
        bi.name as boost_name,
        bi.description,
        bi.effect,
        ub.quantity
      FROM user_boosts ub
      JOIN boost_items bi ON ub.boost_id = bi.id
      WHERE ub.user_id = $1
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows;
  }

  static async deductBoost(userId, boostId) {
    const query = `
      UPDATE user_boosts
      SET quantity = quantity - 1
      WHERE user_id = $1 AND boost_id = $2 AND quantity > 0
      RETURNING *
    `;
    const { rows } = await pool.query(query, [userId, boostId]);
    return rows[0];
  }
}