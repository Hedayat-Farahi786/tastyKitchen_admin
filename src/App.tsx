// src/App.jsx
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import Orders from './components/Orders';
import Products from './components/Products';
import Categories from './components/Categories';
import Testimonials from './components/Testimonials';
import Contacts from './components/Contacts';
import Users from './components/Users';
import OrderDetail from './components/OrderDetail';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="/orders/:orderNumber" element={<OrderDetail />} />
          <Route path="products" element={<Products />} />
          <Route path="categories" element={<Categories />} />
          <Route path="testimonials" element={<Testimonials />} />
          <Route path="contact" element={<Contacts />} />
          <Route path="users" element={<Users />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;