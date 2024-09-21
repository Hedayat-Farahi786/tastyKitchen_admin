import React, { useEffect, useState } from 'react';
import { Card, CardBody } from 'reactstrap';
import { Link } from 'react-router-dom';
import io from 'socket.io-client';
import { FiChevronRight, FiEye } from 'react-icons/fi';

const socket = io("http://localhost:5000", {
  transports: ["websocket", "polling"],
  reconnectionAttempts: 5,
  timeout: 20000,
  withCredentials: true,
});

const ProjectTables = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    socket.on("new_order", fetchOrders);
    fetchOrders();
    return () => {
      socket.off("new_order", fetchOrders);
      socket.disconnect();
    };
  }, []);

  const fetchOrders = () => {
    setLoading(true);
    fetch("https://tastykitchen-backend.vercel.app/orders/dashboardOrders")
      .then((response) => response.json())
      .then((data) => {
        setTableData(data);
        setLoading(false);
      })
      .catch((error) => console.error("Error fetching data:", error));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1; // Months are zero-indexed
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}.${month}.${year} - ${hours}:${minutes}`;
  };

  return (
    <Card className="shadow-sm border-0 overflow-hidden">
      <CardBody className="p-0">
        {loading ? (
          <div className="p-6 animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="h-4 bg-gray-200 rounded w-full"></div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-800">Recent Orders</h3>
              <Link to="/orders" className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors duration-200 flex items-center">
                View All <FiChevronRight className="ml-1" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tableData.map((order) => (
                    <tr key={order.orderNumber} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.orderNumber}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {order.products.map((product, index) => (
                            <span key={product.productId._id} className="block">
                              {product.productId.name} 
                              <span className="text-gray-500"> x{product.quantity}</span>
                              {index !== order.products.length - 1 && ', '}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{order.totalPrice.toFixed(2)}€</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.customer.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(order.time)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <Link to={`/orders/${order.orderNumber}`} className="text-red-600 hover:text-red-900 transition-colors duration-200">
                          <FiEye className="inline-block w-5 h-5" />
                          <span className="sr-only">View Order</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
};

export default ProjectTables;