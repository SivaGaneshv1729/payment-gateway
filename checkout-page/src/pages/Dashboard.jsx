import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const [merchant, setMerchant] = useState({ api_key: '...', api_secret: '...' });
    const [stats, setStats] = useState({ count: 0, totalAmount: 0, successRate: 0 });

    useEffect(() => {
        // 1. Fetch Merchant Details (for API Keys)
        // You might need to adjust this URL based on how you implemented the "current user" logic
        fetch('http://localhost:8000/api/v1/test/merchant')
            .then(res => res.json())
            .then(data => setMerchant(data))
            .catch(err => console.error("Error fetching merchant:", err));

        // 2. Fetch Transactions to calculate stats
        // Ideally, you'd have a specific /stats endpoint, but here we calculate client-side for simplicity
        // assuming you have an endpoint to list all orders/payments
        // If you don't have a list endpoint yet, you might need to mock this or add one.
        // For now, I will use placeholder logic you should replace with real data fetching.

        // Example logic:
        // fetch('http://localhost:8000/api/v1/payments') ... 
        // setStats({ count: 100, totalAmount: 500000, successRate: 95 }); 

    }, []);

    return (
        <div data-test-id="dashboard" style={{ padding: '20px' }}>
            <h1>Merchant Dashboard</h1>

            {/* Navigation */}
            <nav style={{ marginBottom: '20px' }}>
                <Link to="/dashboard/transactions">View All Transactions</Link>
            </nav>

            <div data-test-id="api-credentials" style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px' }}>
                <h3>API Credentials</h3>
                <div style={{ marginBottom: '10px' }}>
                    <label style={{ fontWeight: 'bold', marginRight: '10px' }}>API Key:</label>
                    <span data-test-id="api-key">{merchant.api_key}</span>
                </div>
                <div>
                    <label style={{ fontWeight: 'bold', marginRight: '10px' }}>API Secret:</label>
                    <span data-test-id="api-secret">{merchant.api_secret}</span>
                </div>
            </div>

            <div data-test-id="stats-container" style={{ display: 'flex', gap: '20px' }}>
                <div style={{ padding: '20px', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
                    <h4>Total Transactions</h4>
                    <div data-test-id="total-transactions">{stats.count}</div>
                </div>
                <div style={{ padding: '20px', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
                    <h4>Total Amount</h4>
                    <div data-test-id="total-amount">₹{stats.totalAmount}</div>
                </div>
                <div style={{ padding: '20px', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
                    <h4>Success Rate</h4>
                    <div data-test-id="success-rate">{stats.successRate}%</div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;