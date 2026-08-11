import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/common/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CustomerList from './pages/customers/CustomerList';
import CustomerForm from './pages/customers/CustomerForm';
import CustomerDetails from './pages/customers/CustomerDetails';
import ProductList from './pages/products/ProductList';
import ProductForm from './pages/products/ProductForm';
import ProductDetails from './pages/products/ProductDetails';
import InventoryList from './pages/inventory/InventoryList';
import StockMovement from './pages/inventory/StockMovement';
import ChallanList from './pages/challans/ChallanList';
import ChallanForm from './pages/challans/ChallanForm';
import ChallanDetails from './pages/challans/ChallanDetails';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/customers" element={<ProtectedRoute><CustomerList /></ProtectedRoute>} />
            <Route path="/customers/new" element={<ProtectedRoute><CustomerForm /></ProtectedRoute>} />
            <Route path="/customers/:id" element={<ProtectedRoute><CustomerDetails /></ProtectedRoute>} />
            <Route path="/customers/:id/edit" element={<ProtectedRoute><CustomerForm /></ProtectedRoute>} />
            <Route path="/products" element={<ProtectedRoute><ProductList /></ProtectedRoute>} />
            <Route path="/products/new" element={<ProtectedRoute><ProductForm /></ProtectedRoute>} />
            <Route path="/products/:id" element={<ProtectedRoute><ProductDetails /></ProtectedRoute>} />
            <Route path="/products/:id/edit" element={<ProtectedRoute><ProductForm /></ProtectedRoute>} />
            <Route path="/inventory" element={<ProtectedRoute><InventoryList /></ProtectedRoute>} />
            <Route path="/inventory/stock-in" element={<ProtectedRoute><StockMovement /></ProtectedRoute>} />
            <Route path="/inventory/stock-out" element={<ProtectedRoute><StockMovement /></ProtectedRoute>} />
            <Route path="/challans" element={<ProtectedRoute><ChallanList /></ProtectedRoute>} />
            <Route path="/challans/new" element={<ProtectedRoute><ChallanForm /></ProtectedRoute>} />
            <Route path="/challans/:id" element={<ProtectedRoute><ChallanDetails /></ProtectedRoute>} />
            <Route path="/challans/:id/edit" element={<ProtectedRoute><ChallanForm /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
