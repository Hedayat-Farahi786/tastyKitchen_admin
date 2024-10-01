import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardBody, Button } from "reactstrap";
import {
  FiDownload,
  FiArrowLeft,
  FiPhone,
  FiMail,
  FiMapPin,
  FiClock,
  FiCreditCard,
} from "react-icons/fi";
import { FaRegUser } from "react-icons/fa";
import { VscNote } from "react-icons/vsc";

const OrderDetail = () => {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderNumber]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://tastykitchen-backend.vercel.app/orders/${orderNumber}`
      );
      const data = await response.json();
      setOrder(data);
    } catch (error) {
      console.error("Error fetching order details:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPaymentIcon = (paymentMethod) => {
    switch (paymentMethod.toLowerCase()) {
      case "barzahlung":
        return "cash";
      case "credit card":
        return "credit-card";
      case "paypal":
        return "paypal";
      default:
        return "credit-card";
    }
  };

  const getExtras = (product) => {
    if (!product.extras || product.extras.length === 0) return "No extras";
    return product.extras
      .map(
        (extraId) =>
          product.productId.menuId.extras.find((e) => e._id === extraId)?.name
      )
      .filter(Boolean)
      .join(", ");
  };

  if (loading) {
    return (
      <div className="p-4 max-w-6xl mx-auto">
        <Card className="shadow-lg border-0 rounded-lg overflow-hidden">
          <CardBody className="p-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-4 max-w-6xl mx-auto">
        <Card className="shadow-lg border-0 rounded-lg overflow-hidden">
          <CardBody className="p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Order Not Found
            </h2>
            <Link
              to="/orders"
              className="text-red-600 hover:text-red-800 flex items-center"
            >
              <FiArrowLeft className="mr-2" />
              Back to Orders
            </Link>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-5 w-full mx-auto">
      <Card className="shadow-sm border-0 rounded-lg overflow-hidden">
        <CardBody className="p-8">
    
          <div className="flex justify-between items-center mb-8">
          <div className="my-">
            <Link
              to="/orders"
              className="text-red-600 hover:text-red-800 flex items-center transition-colors duration-150"
            >
              <FiArrowLeft className="mr-2" />
              Back to Orders
            </Link>
          </div>
            <h2 className="text-3xl font-bold text-gray-800">
              Order #{order.orderNumber}
            </h2>
            <Button
              color="success"
              className="flex items-center px-4 py-2 rounded-lg transition-colors duration-150"
              onClick={() => console.log("Download invoice")}
            >
              <div className="flex items-center">
                <FiDownload className="mr-2" />
                <span>Download Invoice</span>
              </div>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-4 text-gray-700">
                Customer Details
              </h3>
              <p className="flex items-center mb-2">
                <FaRegUser className="mr-2 text-gray-500" />{" "}
                {order.customer.name}
              </p>
              <p className="flex items-center mb-2">
                <FiPhone className="mr-2 text-gray-500" />
                {order.customer.phone}
              </p>
              {order.customer.email && (
                <p className="flex items-center mb-2">
                  <FiMail className="mr-2 text-gray-500" />
                  {order.customer.email}
                </p>
              )}
            </div>
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-4 text-gray-700">
                Delivery Address
              </h3>
              <p className="flex items-start mb-2">
                <FiMapPin className="mr-2 mt-1 text-gray-500" />
                <span>
                  {order.delivery.street}, {order.delivery.postcode} München
                </span>
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-4 text-gray-700">
                Order Info
              </h3>
              <p className="flex items-center mb-2">
                <FiClock className="mr-2 text-gray-500" />
                {formatDate(order.time)}
              </p>
              <p className="flex items-center mb-2">
                <FiCreditCard className="mr-2 text-gray-500" />
                {order.payment}
              </p>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-2xl font-semibold mb-4 text-gray-800">
              Order Items
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Extras
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {order.products.map((product) => (
                    <tr key={product.productId?._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-16 w-16">
                            <img
                              className="h-16 w-16 rounded-md object-cover"
                              src={product.productId?.image}
                              alt={product.productId?.name}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {product.productId?.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {getExtras(product)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.price.toFixed(2)}€
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(product.price * product.quantity).toFixed(2)}€
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>
                      <p className="flex items-center my-2">
                        <span className="font-semibold mr-2">Total:</span>
                        <span className="text-2xl font-bold text-green-600">
                          {order.totalPrice.toFixed(2)}€
                        </span>
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {order.delivery.note && (
            <div className="mb-8 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2 text-yellow-800">
                Delivery Note
              </h3>
              <p className="text-yellow-700">{order.delivery.note}</p>
            </div>
          )}

         
        </CardBody>
      </Card>
    </div>
  );
};

export default OrderDetail;
