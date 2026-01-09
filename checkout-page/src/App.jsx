import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Checkout from './pages/Checkout';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/dashboard/transactions" element={<Transactions />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/" element={<Login />} />
            </Routes>
        </BrowserRouter>
    );
}
export default App;