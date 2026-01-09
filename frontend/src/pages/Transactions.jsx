import React, { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';

const Transactions = () => {
    const [payments, setPayments] = useState([]);
    const apiKey = localStorage.getItem('x-api-key');
    const apiSecret = localStorage.getItem('x-api-secret');

    useEffect(() => {
        fetch('http://localhost:8000/api/v1/payments', {
            headers: { 'X-Api-Key': apiKey, 'X-Api-Secret': apiSecret }
        })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setPayments(data);
            })
            .catch(console.error);
    }, []);

    return (
        <DashboardLayout title="Transactions" subtitle="View all your payment activities">
            <div className="table-container">
                <table data-test-id="transactions-table">
                    <thead>
                        <tr>
                            <th>Payment ID</th>
                            <th>Order ID</th>
                            <th>Amount</th>
                            <th>Method</th>
                            <th>Status</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.length === 0 ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>No transactions yet</td></tr>
                        ) : (
                            payments.map(p => (
                                <tr key={p.id} data-test-id="transaction-row" data-payment-id={p.id}>
                                    <td data-test-id="payment-id" style={{ fontFamily: 'monospace' }}>{p.id}</td>
                                    <td data-test-id="order-id" style={{ fontFamily: 'monospace' }}>{p.order_id}</td>
                                    <td data-test-id="amount" style={{ fontWeight: 'bold' }}>₹{p.amount / 100}</td>
                                    <td data-test-id="method" style={{ textTransform: 'capitalize' }}>{p.method}</td>
                                    <td>
                                        <span className={`status-badge status-${p.status}`} data-test-id="status">
                                            {p.status}
                                        </span>
                                    </td>
                                    <td data-test-id="created-at">{new Date(p.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </DashboardLayout>
    );
};

export default Transactions;
