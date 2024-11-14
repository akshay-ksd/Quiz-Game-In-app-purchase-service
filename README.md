# Express.js Game Backend API

A robust Node.js/Express.js backend API for managing in-game purchases, boosts, vouchers, and rewards.

## Features

- 🎮 In-app Purchase Management
- 🚀 Boost System
- 🎫 Voucher Redemption
- 💰 Virtual Currency (Coins)
- 🏆 Winner/Reward Management
- 📊 Transaction Logging

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd express-psql-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following content:
```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=express_db
DB_PASSWORD=postgres
DB_PORT=5432
```

4. Initialize the database:
```bash
psql -U postgres -d express_db -f src/init.sql
```

5. Start the development server:
```bash
npm run dev
```

## API Documentation

### In-app Purchases

#### GET /api/in-app-purchases
Retrieve all available in-app purchase items.

Response:
```json
{
  "items": [
    {
      "id": 1,
      "item_name": "100 Coins",
      "item_type": "coins",
      "price": 1.99,
      "description": "Get 100 coins to use in-game"
    }
  ]
}
```

#### POST /api/purchase
Create a new purchase transaction.

Request:
```json
{
  "userId": 123,
  "itemId": 1,
  "paymentInfo": {
    "transactionId": "txn_123",
    "amount": 1.99
  }
}
```

Response:
```json
{
  "message": "Purchase initiated",
  "purchase": {
    "id": 1,
    "status": "pending",
    "transaction_id": "txn_123"
  }
}
```

### Boosts

#### GET /api/user/boosts/:userId
Get all boosts available for a user.

Response:
```json
{
  "boosts": [
    {
      "boost_id": 1,
      "boost_name": "Extra Wicket",
      "description": "Adds an extra wicket",
      "effect": "Increases wickets by 1",
      "quantity": 2
    }
  ]
}
```

#### POST /api/user/boosts/redeem
Redeem a boost item.

Request:
```json
{
  "user_id": 123,
  "boost_id": 1
}
```

Response:
```json
{
  "message": "Boost redeemed successfully",
  "boost": {
    "name": "Extra Wicket",
    "effect": "Increases wickets by 1",
    "remaining_quantity": 1,
    "activation_time": "2024-01-15T10:00:00Z"
  }
}
```

### Vouchers

#### GET /api/vouchers
Get all available vouchers.

Response:
```json
{
  "vouchers": [
    {
      "id": 1,
      "name": "10% Discount",
      "value": "$5",
      "coin_cost": 100,
      "description": "Get 10% off on your next purchase"
    }
  ]
}
```

#### POST /api/voucher/redeem
Redeem a voucher using coins.

Request:
```json
{
  "userId": 123,
  "voucherId": 1
}
```

Response:
```json
{
  "message": "Voucher redeemed successfully",
  "voucher_code": "VOUCHER-123XYZ",
  "voucher_name": "10% Discount",
  "remaining_coins": 900
}
```

### Coins

#### GET /api/user/coins/:userId
Get user's coin balance.

Response:
```json
{
  "coin_balance": 1000,
  "last_updated": "2024-01-15T10:00:00Z"
}
```

#### POST /api/coins/add
Add coins to a user's account.

Request:
```json
{
  "userId": 123,
  "coinsToAdd": 500
}
```

Response:
```json
{
  "message": "Coins added successfully",
  "new_balance": 1500
}
```

### Transaction Log

#### GET /api/transaction-log/:userId
Get transaction history for a user.

Response:
```json
{
  "transactions": [
    {
      "id": 1,
      "transaction_type": "COIN_ADD",
      "amount": 500,
      "status": "completed",
      "description": "Admin added coins",
      "created_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### Admin Routes

#### POST /api/admin/update-voucher/:voucherId
Update voucher details.

Request:
```json
{
  "value": "10",
  "coinCost": 200,
  "status": "active"
}
```

Response:
```json
{
  "message": "Voucher updated successfully",
  "voucher": {
    "id": 1,
    "name": "10% Discount",
    "value": "10",
    "coin_cost": 200,
    "status": "active"
  }
}
```

## Database Schema

### users
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### purchase_items
```sql
CREATE TABLE purchase_items (
  id SERIAL PRIMARY KEY,
  item_name VARCHAR(50) NOT NULL,
  item_type VARCHAR(20) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### user_accounts
```sql
CREATE TABLE user_accounts (
  user_id INTEGER PRIMARY KEY REFERENCES users(id),
  coins INTEGER DEFAULT 0,
  boosts INTEGER DEFAULT 0,
  last_update TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Error Handling

The API uses standard HTTP status codes and returns detailed error messages:

```json
{
  "error": "Specific error message here"
}
```

Common error codes:
- 400: Bad Request (invalid input)
- 401: Unauthorized
- 403: Forbidden
- 404: Resource Not Found
- 500: Internal Server Error

## Best Practices

1. **Input Validation**
   - All endpoints validate input data
   - Proper error messages for invalid input
   - Type checking and sanitization

2. **Security**
   - Environment variables for sensitive data
   - Input sanitization
   - Rate limiting (to be implemented)
   - JWT authentication (to be implemented)

3. **Database**
   - Prepared statements to prevent SQL injection
   - Transaction support for critical operations
   - Proper indexing on frequently queried columns

4. **Error Handling**
   - Consistent error response format
   - Detailed error messages for debugging
   - Production-safe error responses

## Testing

To run tests (when implemented):
```bash
npm test
```

Test coverage includes:
- Unit tests for models
- Integration tests for API endpoints
- Load testing for performance

## Performance Optimization

1. **Database**
   - Indexed frequently queried columns
   - Optimized SQL queries
   - Connection pooling

2. **API**
   - Response caching
   - Pagination for large datasets
   - Compression middleware

## Deployment

1. **Prerequisites**
   - Node.js runtime
   - PostgreSQL database
   - Environment variables configured

2. **Production Setup**
```bash
# Install dependencies
npm install --production

# Build (if needed)
npm run build

# Start production server
npm start
```

3. **Environment Variables**
   - `NODE_ENV=production`
   - `PORT=3000`
   - Database credentials
   - JWT secret (when implemented)

## Monitoring

Implement monitoring using:
- Morgan for HTTP request logging
- Winston for application logging
- PM2 for process management
- Prometheus/Grafana for metrics (optional)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Guidelines
- Use clear, descriptive commit messages
- Reference issue numbers when applicable
- Keep commits focused and atomic

## License

MIT License - see [LICENSE.md](LICENSE.md) for details

## Support

For support, email [your-email@example.com]

## Authors

- Your Name - Initial work - [YourGithub](https://github.com/yourusername)

## Acknowledgments

- Express.js team
- PostgreSQL community
- Node.js community
- All contributors

## Changelog

### [1.0.0] - 2024-01-15
- Initial release
- Basic API functionality
- Database schema setup
- Documentation