import express from 'express';
import cors from 'cors';
import { pool } from './db.js';
import purchaseRoutes from './routes/purchaseRoutes.js';
import boostRoutes from './routes/boostRoutes.js';
import voucherRoutes from './routes/voucherRoutes.js';
import coinRoutes from './routes/coinRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', purchaseRoutes);
app.use('/api', boostRoutes);
app.use('/api', voucherRoutes);
app.use('/api', coinRoutes);
app.use('/api', transactionRoutes);
app.use('/api', adminRoutes);

// User routes
app.get('/api/users', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM users');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users', async (req, res) => {
  const { name, email } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [name, email]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});