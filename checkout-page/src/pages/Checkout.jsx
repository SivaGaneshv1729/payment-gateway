import React, { useState, useEffect } from 'react';

const Checkout = () => {
    const [order, setOrder] = useState(null);
    const [method, setMethod] = useState(null);
    const [status, setStatus] = useState('initial'); // initial, processing, success, failed
    const [payId, setPayId] = useState(null);

    // Get Order ID from URL
    const searchParams = new URLSearchParams(window.location.search);
    const orderId = searchParams.get('order_id');

    useEffect(() => {
        if (orderId) {
            fetch(`http://localhost:8000/api/v1/orders/${orderId}/public`)
                .then(res => res.json())
                .then(data => {
                    if (data.error) alert(data.error);
                    else setOrder(data);
                })
                .catch(err => console.error(err));
        }
    }, [orderId]);

    const handlePayment = async (e, type) => {
        e.preventDefault();

        let payload = {
            order_id: orderId,
            method: type
        };

        if (type === 'upi') {
            payload.vpa = e.target.querySelector('[data-test-id="vpa-input"]').value;
        } else {
            payload.card = {
                number: e.target.querySelector('[data-test-id="card-number-input"]').value,
                expiry_month: e.target.querySelector('[data-test-id="expiry-input"]').value.split('/')[0],
                expiry_year: e.target.querySelector('[data-test-id="expiry-input"]').value.split('/')[1],
                cvv: e.target.querySelector('[data-test-id="cvv-input"]').value,
                holder_name: e.target.querySelector('[data-test-id="cardholder-name-input"]').value
            };
        }

        setStatus('processing');

        try {
            const res = await fetch('http://localhost:8000/api/v1/payments/public', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (data.error) {
                setStatus('failed');
                return;
            }

            setPayId(data.id);

            // Start Polling
            const interval = setInterval(async () => {
                try {
                    const pollRes = await fetch(`http://localhost:8000/api/v1/payments/${data.id}/public`);
                    const pollData = await pollRes.json();
                    if (pollData.status === 'success' || pollData.status === 'failed') {
                        setStatus(pollData.status);
                        clearInterval(interval);
                    }
                } catch (err) {
                    console.error("Polling error", err);
                }
            }, 2000);
        } catch (err) {
            console.error("Payment error", err);
            setStatus('failed');
        }
    };

    if (!orderId) return <div>Missing Order ID</div>;
    if (!order) return <div>Loading Order...</div>;

    return (
        <div data-test-id="checkout-container">
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>PayPoint Secure Checkout</div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Complete your purchase</div>
            </div>

            <div data-test-id="order-summary" className="order-summary-box">
                <div style={{ marginBottom: '5px', fontSize: '13px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total to Pay</div>
                <div data-test-id="order-amount" style={{ fontSize: '36px', fontWeight: '800', color: '#111827', marginBottom: '16px' }}>
                    ₹{order.amount / 100}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e5e7eb', paddingTop: '12px', fontSize: '13px' }}>
                    <span style={{ color: '#6b7280' }}>Order ID</span>
                    <span data-test-id="order-id" style={{ fontFamily: 'monospace', color: '#374151', background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>
                        {order.id}
                    </span>
                </div>
            </div>

            {status === 'initial' && (
                <>
                    <div data-test-id="payment-methods">
                        <button data-test-id="method-upi" onClick={() => setMethod('upi')}>UPI</button>
                        <button data-test-id="method-card" onClick={() => setMethod('card')}>Card</button>
                    </div>

                    {method === 'upi' && (
                        <form data-test-id="upi-form" onSubmit={(e) => handlePayment(e, 'upi')}>
                            <input data-test-id="vpa-input" placeholder="user@bank" required />
                            <button data-test-id="pay-button" type="submit">Pay ₹{order.amount / 100}</button>
                        </form>
                    )}

                    {method === 'card' && (
                        <form data-test-id="card-form" onSubmit={(e) => handlePayment(e, 'card')}>
                            <input data-test-id="card-number-input" placeholder="Card Number" required />
                            <input data-test-id="expiry-input" placeholder="MM/YY" required />
                            <input data-test-id="cvv-input" placeholder="CVV" required />
                            <input data-test-id="cardholder-name-input" placeholder="Name" required />
                            <button data-test-id="pay-button" type="submit">Pay ₹{order.amount / 100}</button>
                        </form>
                    )}
                </>
            )}

            {status === 'processing' && (
                <div data-test-id="processing-state">
                    <div className="spinner"></div>
                    <span data-test-id="processing-message">Processing payment...</span>
                </div>
            )}

            {status === 'success' && (
                <div data-test-id="success-state">
                    <h2>Payment Successful!</h2>
                    <div><span>Payment ID: </span><span data-test-id="payment-id">{payId}</span></div>
                    <span data-test-id="success-message">Your payment has been processed successfully</span>
                </div>
            )}

            {status === 'failed' && (
                <div data-test-id="error-state">
                    <h2>Payment Failed</h2>
                    <span data-test-id="error-message">Payment could not be processed</span>
                    <button data-test-id="retry-button" onClick={() => setStatus('initial')}>Try Again</button>
                </div>
            )}
        </div>
    );
};

export default Checkout;
