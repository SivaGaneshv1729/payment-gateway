import React from 'react';
import { useLocation, Link } from 'react-router-dom';

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
                    PayPoint
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

export default DashboardLayout;
