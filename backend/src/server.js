const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Database Connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// --- Helpers ---

// Generate Random ID (Alphanumeric 16 chars)
const generateId = (prefix) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 16; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return prefix + result;
};

// Validation Logic
// Validation Logic
const validateLuhn = (num) => {
    // Remove spaces and dashes
    const cleanNum = (num + '').replace(/[\s-]/g, '');
    if (!/^\d+$/.test(cleanNum)) return false; // Ensure only digits
    if (cleanNum.length < 13 || cleanNum.length > 19) return false; // Length check

    let arr = cleanNum.split('').reverse().map(x => parseInt(x));
    let lastDigit = arr.splice(0, 1)[0];
    let sum = arr.reduce((acc, val, i) => (i % 2 !== 0 ? acc + val : acc + ((val * 2) % 9) || 9), 0);
    sum += lastDigit;
    return sum % 10 === 0;
};

const getCardNetwork = (num) => {
    // Remove spaces and dashes
    const cleanNum = (num + '').replace(/[\s-]/g, '');

    if (/^4/.test(cleanNum)) return 'visa';
    if (/^5[1-5]/.test(cleanNum)) return 'mastercard';
    if (/^3[47]/.test(cleanNum)) return 'amex';
    if (/^60|^65|^8[1-9]/.test(cleanNum)) return 'rupay';
    return 'unknown';
};

// --- Middleware ---
const authenticate = async (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    const apiSecret = req.headers['x-api-secret'];

    // Bypass auth for health check, public endpoints, and test endpoints
    if (req.path === '/health' || req.path.includes('/public') || req.path.includes('/test')) {
        return next();
    }

    try {
        const result = await pool.query(
            'SELECT * FROM merchants WHERE api_key = $1 AND api_secret = $2',
            [apiKey, apiSecret]
        );
        if (result.rows.length === 0) {
            return res.status(401).json({ error: { code: 'AUTHENTICATION_ERROR', description: 'Invalid API credentials' } });
        }
        req.merchant = result.rows[0];
        next();
    } catch (err) {
        res.status(500).json({ error: { code: 'INTERNAL_ERROR', description: 'Authentication Error' } });
    }
};

app.use(authenticate);

// --- Endpoints ---

// 1. Health Check
app.get('/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({
            status: "healthy",
            database: "connected",
            timestamp: new Date().toISOString()
        });
    } catch (e) {
        res.json({ status: "unhealthy", database: "disconnected" });
    }
});

// 2. Create Order
app.post('/api/v1/orders', async (req, res) => {
    const { amount, currency, receipt, notes } = req.body;

    if (amount < 100) {
        return res.status(400).json({ error: { code: "BAD_REQUEST_ERROR", description: "amount must be at least 100" } });
    }

    const orderId = generateId('order_');
    const q = `INSERT INTO orders (id, merchant_id, amount, currency, receipt, notes, status) 
               VALUES ($1, $2, $3, $4, $5, $6, 'created') RETURNING *`;

    try {
        const result = await pool.query(q, [orderId, req.merchant.id, amount, currency || 'INR', receipt, notes]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: { code: "INTERNAL_ERROR", description: "Server Error" } });
    }
});

// 3. Get Order (Public for checkout)
app.get('/api/v1/orders/:id/public', async (req, res) => {
    const result = await pool.query('SELECT id, amount, currency, status FROM orders WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: { code: "NOT_FOUND_ERROR", description: "Order not found" } });
    res.json(result.rows[0]);
});

// 4. Create Payment (Authenticated)
app.post('/api/v1/payments', async (req, res) => {
    return handlePaymentCreation(req, res, true);
});

// 4b. Create Payment (Public for Checkout)
app.post('/api/v1/payments/public', async (req, res) => {
    return handlePaymentCreation(req, res, false);
});

const handlePaymentCreation = async (req, res, requiresAuth) => {
    const { order_id, method, vpa, card } = req.body;

    // 1. Check Order
    const orderRes = await pool.query('SELECT * FROM orders WHERE id = $1', [order_id]);
    if (orderRes.rows.length === 0) return res.status(404).json({ error: { code: "NOT_FOUND_ERROR", description: "Order not found" } });
    const order = orderRes.rows[0];

    // 1b. Verify Merchant Ownership (if authenticated)
    if (requiresAuth) {
        if (order.merchant_id !== req.merchant.id) {
            return res.status(401).json({ error: { code: 'AUTHENTICATION_ERROR', description: "Order does not belong to this merchant" } });
        }
    }

    // 2. Validate Inputs
    if (method === 'upi') {
        if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/.test(vpa)) {
            return res.status(400).json({ error: { code: "INVALID_VPA", description: "Invalid VPA format" } });
        }
    } else if (method === 'card') {
        if (!card || !validateLuhn(card.number)) {
            return res.status(400).json({ error: { code: "INVALID_CARD", description: "Invalid Card Number" } });
        }
        // Expiry Validation
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        let expYear = parseInt(card.expiry_year);
        if (expYear < 100) expYear += 2000;

        if (expYear < currentYear || (expYear === currentYear && parseInt(card.expiry_month) < currentMonth)) {
            return res.status(400).json({ error: { code: "EXPIRED_CARD", description: "Card Expired" } });
        }
    } else {
        return res.status(400).json({ error: { code: "BAD_REQUEST_ERROR", description: "Invalid payment method" } });
    }

    const payId = generateId('pay_');
    const cardNetwork = method === 'card' ? getCardNetwork(card.number) : null;
    const cardLast4 = method === 'card' ? card.number.replace(/[\s-]/g, '').slice(-4) : null;

    // 3. Insert 'Processing'
    try {
        await pool.query(
            `INSERT INTO payments (id, order_id, merchant_id, amount, currency, method, status, vpa, card_network, card_last4)
             VALUES ($1, $2, $3, $4, $5, $6, 'processing', $7, $8, $9)`,
            [payId, order_id, order.merchant_id, order.amount, order.currency, method, vpa, cardNetwork, cardLast4]
        );

        // 4. Handle TEST_MODE vs Random Mode
        const isTestMode = process.env.TEST_MODE === 'true';

        // Delay Logic
        const delay = isTestMode
            ? parseInt(process.env.TEST_PROCESSING_DELAY || 1000)
            : Math.floor(Math.random() * (10000 - 5000 + 1) + 5000);

        // Wait
        await new Promise(r => setTimeout(r, delay));

        // Success/Fail Logic
        let isSuccess;
        if (isTestMode) {
            isSuccess = process.env.TEST_PAYMENT_SUCCESS !== 'false';
        } else {
            isSuccess = method === 'upi' ? Math.random() < 0.9 : Math.random() < 0.95;
        }

        const finalStatus = isSuccess ? 'success' : 'failed';
        const errorCode = isSuccess ? null : 'PAYMENT_FAILED';
        const errorDesc = isSuccess ? null : 'Payment declined by bank';

        const finalRes = await pool.query(
            `UPDATE payments SET status = $1, error_code = $2, error_description = $3, updated_at = NOW() WHERE id = $4 RETURNING *`,
            [finalStatus, errorCode, errorDesc, payId]
        );

        res.status(201).json(finalRes.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: { code: "INTERNAL_ERROR", description: "Internal Server Error" } });
    }
};

// 5. Get Payment
app.get('/api/v1/payments/:id', async (req, res) => {
    const result = await pool.query('SELECT * FROM payments WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: { code: "NOT_FOUND_ERROR", description: "Payment not found" } });
    res.json(result.rows[0]);
});

// 5b. Get Payment (Public for Polling)
app.get('/api/v1/payments/:id/public', async (req, res) => {
    const result = await pool.query('SELECT * FROM payments WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: { code: "NOT_FOUND_ERROR", description: "Payment not found" } });
    res.json(result.rows[0]);
});

// 6. List Payments (For Dashboard)
app.get('/api/v1/payments', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM payments WHERE merchant_id = $1 ORDER BY created_at DESC', [req.merchant.id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: { code: "INTERNAL_ERROR", description: "Internal Server Error" } });
    }
});

// Test Endpoints
app.get('/api/v1/test/merchant', async (req, res) => {
    const result = await pool.query("SELECT id, email, api_key, 'true' as seeded FROM merchants WHERE email = 'test@example.com'");
    if (result.rows.length > 0) res.json(result.rows[0]);
    else res.status(404).json({});
});

app.listen(8000, () => console.log('Server running on 8000'));