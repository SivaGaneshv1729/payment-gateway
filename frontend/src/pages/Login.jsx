import React from 'react';
import { useNavigate } from 'react-router-dom';

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
                <div className="brand-title">PayPoint</div>
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

export default Login;
