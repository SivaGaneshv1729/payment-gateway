const http = require('http');

const request = (path, method, headers, body) => {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: 8000,
            path: path,
            method: method,
            headers: headers
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: data }));
        });
        req.on('error', reject);
        if (body) req.write(body);
        req.end();
    });
};

async function test() {
    try {
        // 1. Merchant Test (Should be 200 OK)
        console.log('Testing Merchant Endpoint...');
        const r1 = await request('/api/v1/test/merchant', 'GET', {});
        console.log('Merchant Status:', r1.status);
        console.log('Merchant Body:', r1.body);

        // 2. Order Create (Should be 201 Created)
        console.log('\nTesting Order Create...');
        const r2 = await request('/api/v1/orders', 'POST', {
            'Content-Type': 'application/json',
            'X-Api-Key': 'key_test_abc123',
            'X-Api-Secret': 'secret_test_xyz789'
        }, JSON.stringify({ amount: 50000, currency: 'INR', receipt: 'r1' }));
        console.log('Order Status:', r2.status);
        console.log('Order Body:', r2.body);

        // 3. Health Check
        console.log('\nTesting Health...');
        const r3 = await request('/health', 'GET', {});
        console.log('Health Status:', r3.status);
        console.log('Health Body:', r3.body);

        // 4. 404 Check
        console.log('\nTesting 404...');
        const r4 = await request('/api/v1/orders/nonexistent/public', 'GET', {});
        console.log('404 Status:', r4.status);
        console.log('404 Body:', r4.body);

    } catch (e) {
        console.error(e);
    }
}

test();
