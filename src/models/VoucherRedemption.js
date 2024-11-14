import { pool } from '../db.js';

export class VoucherRedemption {
  static async create({ userId, voucherId, voucherCode }) {
    const query = `
      INSERT INTO voucher_redemptions (user_id, voucher_id, voucher_code)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const { rows } = await pool.query(query, [userId, voucherId, voucherCode]);
    return rows[0];
  }

  static async findByCode(voucherCode) {
    const query = `
      SELECT vr.*, v.name, v.value
      FROM voucher_redemptions vr
      JOIN vouchers v ON vr.voucher_id = v.id
      WHERE vr.voucher_code = $1
    `;
    const { rows } = await pool.query(query, [voucherCode]);
    return rows[0];
  }

  static async findByUserId(userId) {
    const query = `
      SELECT 
        vr.voucher_code,
        vr.redeemed_at,
        v.name as voucher_name,
        v.value as voucher_value,
        v.description
      FROM voucher_redemptions vr
      JOIN vouchers v ON vr.voucher_id = v.id
      WHERE vr.user_id = $1
      ORDER BY vr.redeemed_at DESC
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows;
  }
}