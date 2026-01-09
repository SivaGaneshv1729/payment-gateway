import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        // Fetch real transactions from your API
        fetch('http://localhost:8000/api/v1/payments', {
            headers: {
                'X-Api-Key': 'key_test_abc123',
                'X-Api-Secret': 'secret_test_xyz789'
            }
        })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setTransactions(data);
                else console.error("Expected array, got:", data);
            })
            .catch(err => console.error("Error fetching transactions:", err));
    }, []);

    return (
        <div style={{ padding: '20px' }}>
            <h1>Transaction History</h1>
            <Link to="/dashboard">Back to Dashboard</Link>

            <table data-test-id="transactions-table" style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ textAlign: 'left', backgroundColor: '#eee' }}>
                        <th>Payment ID</th>
                        <th>Order ID</th>
                        <th>Amount</th>
                        <th>Method</th>
                        <th>Status</th>
                        <th>Created</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map((txn) => (
                        <tr
                            key={txn.id}
                            data-test-id="transaction-row"
                            data-payment-id={txn.id}
                            style={{ borderBottom: '1px solid #ddd' }}
                        >
                            <td data-test-id="payment-id">{txn.id}</td>
                            <td data-test-id="order-id">{txn.order_id}</td>
                            <td data-test-id="amount">{txn.amount}</td>
                            <td data-test-id="method">{txn.method}</td>
                            <td data-test-id="status">{txn.status}</td>
                            <td data-test-id="created-at">{txn.created_at}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Transactions;