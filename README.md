
# Payment Gateway with Multi-Method Processing and Hosted Checkout

A full-stack payment gateway simulation similar to Razorpay or Stripe. This system allows merchants to onboard, generate payment orders via API, and enables customers to make payments using UPI or Credit/Debit Cards through a hosted checkout page.

The project simulates real-world banking delays, success/failure rates, and strict validation logic (Luhn algorithm, VPA validation) without connecting to actual banking networks.

## 🚀 Features

*   **Multi-Method Processing:** Supports **UPI** (with VPA validation) and **Card** payments (with Network detection & Luhn validation).
*   **Hosted Checkout:** A user-friendly React-based checkout page that handles the payment lifecycle.
*   **Merchant Dashboard:** A React dashboard for merchants to view transaction history and API credentials.
*   **Bank Simulation:**
    *   Simulates network latency (5-10 seconds processing time).
    *   Randomized success/failure rates (90% for UPI, 95% for Cards).
    *   **Test Mode** for deterministic automated evaluation.
*   **Robust Architecture:** Fully containerized using Docker and Orchestrated via Docker Compose.

---

## 🛠️ Tech Stack

*   **Backend:** Node.js, Express.js
*   **Database:** PostgreSQL
*   **Frontend (Dashboard & Checkout):** React.js, Vite
*   **Infrastructure:** Docker, Docker Compose
*   **Testing:** Jest (logic), Custom Automated Script (End-to-End)

---

## 📂 System Architecture & Ports

The system comprises four micro-services orchestrated by Docker Compose:

```mermaid
graph TD
    User[User] -->|Browser| Checkout[Checkout Page :3001]
    Merchant[Merchant] -->|Browser| Dashboard[Dashboard :3000]
    Checkout -->|HTTP| API[Backend API :8000]
    Dashboard -->|HTTP| API
    API -->|SQL| DB[(PostgreSQL :5432)]
```

| Service | Container Name | Port | Description |
| --- | --- | --- | --- |
| **API** | `gateway_api` | **8000** | Core business logic, validation, and DB interactions. |
| **Database** | `pg_gateway` | **5432** | PostgreSQL database for Merchants, Orders, and Payments. |
| **Dashboard** | `gateway_dashboard` | **3000** | Merchant UI to view stats and transactions. |
| **Checkout** | `gateway_checkout` | **3001** | Public-facing payment page for customers. |

---

## ⚡ Getting Started

### Prerequisites

*   Docker & Docker Compose installed on your machine.

### Installation & Run

The entire system is designed to run with a single command.

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd payment-gateway
    ```

2.  **Start the services:**
    ```bash
    docker-compose up -d --build
    ```

3.  **Verify Status:**
    The API Health check should return `healthy`.
    ```bash
    curl http://localhost:8000/health
    ```

### Test Credentials (Auto-Seeded)

The database automatically seeds a test merchant on startup. Use these credentials for testing the API and logging into the Dashboard.

*   **Email:** `test@example.com`
*   **API Key:** `key_test_abc123`
*   **API Secret:** `secret_test_xyz789`
*   **Merchant ID:** `550e8400-e29b-41d4-a716-446655440000`

---

## 🤖 Automated Testing

An automated test script is included to verify the end-to-end payment flow (Order Creation -> Payment -> Polling -> Success) without manual intervention.

**Run the test:**
```bash
node test_full_flow.js
```

**Expected Output:**
```text
🚀 Starting PayPoint Automated Flow Test
1️⃣  Creating Order...
   ✅ Order Created: order_XXXX (₹750)
2️⃣  Initiating UPI Payment...
   ✅ Payment Initiated: pay_XXXX
3️⃣  Polling for Completion...
🎉 Test PASSED! Payment SUCCESS
```

---

## 📖 API Documentation

### Base URL: `http://localhost:8000`

#### 1. Create Order

Creates a payment order.

*   **Endpoint:** `POST /api/v1/orders`
*   **Auth:** Basic Auth (API Key/Secret headers)
*   **Headers:**
    *   `X-Api-Key`: `key_test_abc123`
    *   `X-Api-Secret`: `secret_test_xyz789`
*   **Body:**
    ```json
    {
      "amount": 50000,
      "currency": "INR",
      "receipt": "rcpt_1"
    }
    ```

#### 2. Process Payment

Initiates a payment (used by Checkout Page).

*   **Endpoint:** `POST /api/v1/payments/public`
*   **Body (Card):**
    ```json
    {
      "order_id": "order_NXhj67fGH2jk9mPq",
      "method": "card",
      "card": {
        "number": "4111111111111111",
        "expiry_month": "12",
        "expiry_year": "2025",
        "cvv": "123",
        "holder_name": "John Doe"
      }
    }
    ```
*   **Body (UPI):**
    ```json
    {
      "order_id": "order_NXhj67fGH2jk9mPq",
      "method": "upi",
      "vpa": "test@upi"
    }
    ```

#### 3. Get Payment Status

*   **Endpoint:** `GET /api/v1/payments/{payment_id}`

---

## ⚙️ Configuration & Environment

The application is configured via environment variables. A `.env.example` is provided in the root.

**Default Configuration:**

```ini
DATABASE_URL=postgresql://gateway_user:gateway_pass@postgres:5432/payment_gateway
PORT=8000

# Simulation Logic
UPI_SUCCESS_RATE=0.90
CARD_SUCCESS_RATE=0.95

# Test Mode (For Automated Evaluation)
TEST_MODE=false
TEST_PAYMENT_SUCCESS=true
TEST_PROCESSING_DELAY=1000
```

### Test Mode

To enable deterministic testing (bypassing random failures and long delays), set `TEST_MODE=true` in the environment.

*   When `true`, payments will succeed/fail based on `TEST_PAYMENT_SUCCESS`.
*   Processing delay will use `TEST_PROCESSING_DELAY` (ms) instead of the random 5-10s range.

---

## 🗂 Project Structure

```text
payment-gateway/
├── backend/
│   ├── src/server.js       # Main API logic
│   └── Dockerfile
├── frontend/               # Merchant Dashboard
│   ├── src/pages/          # Login, Dashboard, Transactions
│   ├── src/components/     # DashboardLayout
│   └── Dockerfile
├── checkout-page/          # Customer Checkout UI
│   ├── src/pages/          # Checkout Form
│   └── Dockerfile
├── docker-compose.yml      # Service Orchestration
├── test_full_flow.js       # Automated E2E Test Script
└── README.md
```

## 📸 Screenshots

### Merchant Dashboard
| Login Page | Overview |
| --- | --- |
| ![Login](screenshots/login.png) | ![Overview](screenshots/overview.png) |

| Transactions |
| --- |
| ![Transactions](screenshots/transactions.png) |

### Checkout Page
| Payment Selection | Success State |
| --- | --- |
| ![Checkout](screenshots/checkout.png) | ![Success](screenshots/success.png) |


## 🎥 Video Walkthrough

Watch the full Sproject architecture, code structure, and live demo here:
https://drive.google.com/file/d/1cljMdL5hDeJeydbD2C7ENTlXktydOAPf/view?usp=sharing

## 📝 License

This project is part of a Full-Stack Development assessment. Code is provided for educational and evaluation purposes.