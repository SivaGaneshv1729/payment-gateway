import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Link } from 'react-router-dom';

// --- Components ---

// 1. Sidebar Layout (Wraps Dashboard & Transactions)
const DashboardLayout = ({ children, title, subtitle }) => {
    const location = useLocation();

    return (
        <div className="dashboard-layout" data-test-id="dashboard">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M2 17L12 22L22 17" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M2 12L12 17L22 12" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    PayGate
                </div>
                <nav>
                    <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>
                        Overview
                    </Link>
                    <Link to="/dashboard/transactions" className={`nav-link ${location.pathname.includes('transactions') ? 'active' : ''}`}>
                        Transactions
                    </Link>
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="main-content">
                <div className="page-header">
                    <h1>{title}</h1>
                    <div className="welcome-text">{subtitle}</div>
                </div>
                {children}
            </main>
        </div>
    );
};

// 2. Login Page
const Login = () => {
    const navigate = useNavigate();
    const handleLogin = (e) => {
        e.preventDefault();
        const email = e.target.elements[0].value;
        if (email === 'test@example.com') {
            localStorage.setItem('x-api-key', 'key_test_abc123');
            localStorage.setItem('x-api-secret', 'secret_test_xyz789');
            navigate('/dashboard');
        } else {
            alert('Use test@example.com');
        }
    };

    return (
        <div className="login-container">
            <form data-test-id="login-form" onSubmit={handleLogin}>
                <div className="brand-title">PayGate</div>
                <div className="brand-subtitle">Sign in to your dashboard</div>

                <div className="form-group">
                    <label>Email Address</label>
                    <input data-test-id="email-input" type="email" defaultValue="test@example.com" />
                </div>

                <div className="form-group">
                    <label>Password</label>
                    <input data-test-id="password-input" type="password" placeholder="••••" />
                </div>

                <button data-test-id="login-button" type="submit">Sign In</button>

                <div style={{ marginTop: '20px', fontSize: '12px', color: '#9CA3AF' }}>
                    Use test@example.com and any password
                </div>
            </form>
        </div>
    );
};

// 3. Overview Page (Dashboard Home)
const Overview = () => {
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

// 4. Transactions Page
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

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Overview />} />
                <Route path="/dashboard/transactions" element={<Transactions />} />
                <Route path="/" element={<Login />} />
            </Routes>
        </BrowserRouter>
    );
}