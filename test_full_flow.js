const http = require('http');

console.log("🚀 Starting PayPoint Automated Flow Test\n");

const request = (method, path, body = null, headers = {}) => {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: 8000,
            path: path,
            method: method,
            headers: { 'Content-Type': 'application/json', ...headers }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, body: data ? JSON.parse(data) : {} });
                } catch (e) {
                    resolve({ status: res.statusCode, body: data });
                }
            });
        });
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runTest() {
    try {
        // 1. Create Order
        console.log("1️⃣  Creating Order...");
        const orderRes = await request('POST', '/api/v1/orders', {
            amount: 75000, // ₹750.00
            currency: "INR",
            receipt: "auto_test_" + Date.now()
        }, {
            'X-Api-Key': 'key_test_abc123',
            'X-Api-Secret': 'secret_test_xyz789'
        });

        if (orderRes.status !== 201) throw new Error("Order creation failed: " + JSON.stringify(orderRes.body));
        const orderId = orderRes.body.id;
        console.log(`   ✅ Order Created: ${orderId} (₹${orderRes.body.amount / 100})`);

        // 2. Make Payment (UPI)
        console.log("\n2️⃣  Initiating UPI Payment...");
        const payRes = await request('POST', '/api/v1/payments/public', {
            order_id: orderId,
            method: "upi",
            vpa: "automation@test"
        });

        if (payRes.status !== 201) throw new Error("Payment init failed: " + JSON.stringify(payRes.body));
        const payId = payRes.body.id;
        console.log(`   ✅ Payment Initiated: ${payId}`);

        // 3. Poll for Status
        console.log("\n3️⃣  Polling for Completion (Waiting 5-10s)...");
        let status = 'processing';
        let attempts = 0;

        while (status === 'processing' && attempts < 10) {
            await delay(2000); // Wait 2s
            process.stdout.write(".");

            const pollRes = await request('GET', `/api/v1/payments/${payId}/public`);
            status = pollRes.body.status;
            attempts++;
        }
        console.log("");

        if (status === 'success') {
            console.log(`\n🎉 Test PASSED! Payment ${status.toUpperCase()}`);
        } else {
            console.log(`\n❌ Test FAILED or TIMED OUT. Status: ${status}`);
        }

    } catch (err) {
        console.error("\n❌ Error during test:", err.message);
    }
}

runTest();
