import React, { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';

const Dashboard = () => {
    const [stats, setStats] = useState({ count: 0, amount: 0, successRate: 0 });
    const apiKey = localStorage.getItem('x-api-key') || 'Not Logged In';
    const apiSecret = localStorage.getItem('x-api-secret') || 'Not Logged In';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('http://localhost:8000/api/v1/payments', {
                    headers: { 'X-Api-Key': apiKey, 'X-Api-Secret': apiSecret }
                });
                if (res.ok) {
                    const data = await res.json();
                    const totalTx = data.length;
                    const successTx = data.filter(p => p.status === 'success');
                    const totalAmt = successTx.reduce((acc, curr) => acc + curr.amount, 0);
                    const rate = totalTx > 0 ? Math.round((successTx.length / totalTx) * 100) : 0;

                    setStats({ count: totalTx, amount: totalAmt, successRate: rate });
                }
            } catch (e) { console.error(e); }
        };
        fetchData();
    }, [apiKey, apiSecret]);

    return (
        <DashboardLayout title="Dashboard" subtitle="Welcome back, Merchant">
            {/* Statistics Cards */}
            <div data-test-id="stats-container">
                <div className="stat-card">
                    <div className="stat-label">Total Volume</div>
                    <div className="stat-value" data-test-id="total-amount">₹{stats.amount / 100}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Transactions</div>
                    <div className="stat-value" data-test-id="total-transactions">{stats.count}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Success Rate</div>
                    <div className="stat-value green" data-test-id="success-rate">{stats.successRate}%</div>
                </div>
            </div>

            {/* API Credentials Section */}
            <div className="credentials-section" data-test-id="api-credentials">
                <h2>API Credentials</h2>
                <div className="credentials-desc">Use these keys to authenticate your API requests.</div>

                <label className="key-label">Publishable Key</label>
                <div className="key-box" data-test-id="api-key">{apiKey}</div>

                <label className="key-label">Secret Key</label>
                <div className="key-box" data-test-id="api-secret">{apiSecret}</div>
            </div>
        </DashboardLayout>
    );
};

export default Dashboard;
