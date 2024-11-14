import { pool } from '../db.js';

export class PurchaseItem {
  static async findAll() {
    const query = `
      SELECT id, item_name, item_type, price, description 
      FROM purchase_items
      ORDER BY id ASC
    `;
    const { rows } = await pool.query(query);
    return rows;
  }

  static async findById(id) {
    const query = `
      SELECT id, item_name, item_type, price, description 
      FROM purchase_items 
      WHERE id = $1
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }
}