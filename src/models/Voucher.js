import { pool } from '../db.js';

export class Voucher {
  static async findAll() {
    const query = `
      SELECT id, name, value, coin_cost, description, status
      FROM vouchers
      ORDER BY coin_cost ASC
    `;
    const { rows } = await pool.query(query);
    return rows;
  }

  static async findById(id) {
    const query = `
      SELECT id, name, value, coin_cost, description, status
      FROM vouchers
      WHERE id = $1
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }

  static async update(id, { value, coinCost, status }) {
    const query = `
      UPDATE vouchers
      SET 
        value = $1,
        coin_cost = $2,
        status = $3,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING 
        id,
        name,
        value,
        coin_cost,
        description,
        status,
        created_at,
        updated_at
    `;
    
    const { rows } = await pool.query(query, [value, coinCost, status, id]);
    return rows[0];
  }
}