// src/App.jsx
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Sales';
import PrivateRoute from './components/PrivateRoute';
import Orders from './components/Orders';
import Products from './components/Products';
import Categories from './components/Categories';
import Testimonials from './components/Testimonials';
import Contacts from './components/Contacts';
import Users from './components/Users';
import OrderDetail from './components/OrderDetail';
import TodaysOrders from './components/TodaysOrders';
import io from "socket.io-client";
const socket = io("https://tastykitchen-websocket.up.railway.app");
import notification from "./assets/notification-sound.mp3"
import { useEffect, useState } from 'react';
import Sales from './components/Sales';

function App() {

  const [audio] = useState(new Audio(notification));

  useEffect(() => {
    // Allow autoplay only after user interaction
    const playSound = () => {
      audio.play().catch((error) => {
        console.warn("Autoplay prevented by browser:", error);
        // You can provide a visual indication to the user if autoplay is blocked
      });
    };
  
    // Listen for new orders from the server
    socket.on("new-order", (newOrder) => {
      console.log("NEW!!!");
      console.log(newOrder);
  
      // Play sound notification
      playSound();
    });
  
    return () => {
      socket.off("new-order"); // Clean up the listener when the component unmounts
    };
  }, [audio]);

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Navigate to="/today" replace />} />
          <Route path="sales" element={<Sales />} />
          <Route path="today" element={<TodaysOrders />} />
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