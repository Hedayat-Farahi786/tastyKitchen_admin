import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardBody,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  InputGroup,
  InputGroupText,
} from "reactstrap";
import {
  FiDownload,
  FiFilter,
  FiSearch,
  FiChevronRight,
  FiChevronLeft,
} from "react-icons/fi";
import cashLogo from "../assets/images/cash.png";
import io from "socket.io-client";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const socket = io("http://localhost:5000", {
  transports: ["websocket", "polling"],
  reconnectionAttempts: 5,
  timeout: 20000,
  withCredentials: true,
});

const Orders = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [searchCriteria, setSearchCriteria] = useState({
    orderNumber: "",
    date: "",
  });
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    socket.on("new_order", () => {
      fetchData(currentPage, itemsPerPage, searchCriteria);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    fetchData(currentPage, itemsPerPage, searchCriteria);
  }, [currentPage, itemsPerPage, searchCriteria]);

  const fetchData = (page, limit, criteria) => {
    setLoading(true);
    const query = new URLSearchParams({ page, limit, ...criteria }).toString();

    fetch(`https://tastykitchen-backend.vercel.app/orders?${query}`)
      .then((response) => response.json())
      .then((data) => {
        setTableData(data.orders);
        setTotalItems(data.total);
        setLoading(false);
      })
      .catch((error) => console.error("Error fetching data:", error));
  };

  const handlePageChange = (page) => setCurrentPage(page);

  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchCriteria((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchData(1, itemsPerPage, searchCriteria);
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

  const totalPages = Math.ceil(totalItems / itemsPerPage);


  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // Fetch all orders data
      const response = await fetch('https://tastykitchen-backend.vercel.app/orders');
      const result = await response.json();
      
      // Check the structure of the returned data
      console.log('API Response:', result);
  
      // Assuming the orders are in result.orders
      const ordersData = result.orders || [];
  
      if (!Array.isArray(ordersData)) {
        throw new Error('Received data is not in the expected format');
      }
  
      // Prepare data for Excel
      const worksheet = XLSX.utils.json_to_sheet(ordersData.map(order => ({
        'Order Number': order.orderNumber,
        'Customer': order.customer?.name || 'N/A',
        'Total Price': order.totalPrice || 0,
        'Payment Method': order.payment || 'N/A',
        'Order Date': order.time ? new Date(order.time).toLocaleString() : 'N/A',
        'Products': order.products ? order.products.map(p => `${p.productId?.name || 'Unknown'} (x${p.quantity || 0})`).join(', ') : 'N/A',
        'Note': order.delivery?.note || 'N/A'
      })));
  
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
  
      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'});
      
      // Save file
      saveAs(blob, `TastyKitchen_Orders_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error("Error downloading orders:", error);
      // Show an error message to the user
      alert("An error occurred while downloading orders. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="p-4">
      <Card className="shadow-sm border-0">
        <CardBody>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">All Orders</h2>
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 items-center md:space-x-2">
              <Button
                color="light"
                className="flex items-center w-full md:w-max justify-center"
                onClick={() => setShowFilters(!showFilters)}
              >
                <span className="flex items-center w-full">
                  <FiFilter className="mr-2" />
                  {showFilters ? "Hide Filters" : "Filters"}
                </span>
              </Button>
              <Button
                color="success"
                className="flex items-center"
                onClick={handleDownload}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Downloading...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <FiDownload className="mr-2" />
                    Download
                  </span>
                )}
              </Button>
            </div>
          </div>

          {showFilters && (
            <Form onSubmit={handleSearchSubmit} className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormGroup>
                  <Label
                    for="orderNumber"
                    className="text-sm font-medium text-gray-700"
                  >
                    Order Number
                  </Label>
                  <InputGroup>
                    <InputGroupText>#</InputGroupText>
                    <Input
                      type="text"
                      name="orderNumber"
                      id="orderNumber"
                      value={searchCriteria.orderNumber}
                      onChange={handleSearchChange}
                      className="form-input"
                    />
                  </InputGroup>
                </FormGroup>
                <FormGroup>
                  <Label
                    for="date"
                    className="text-sm font-medium text-gray-700"
                  >
                    Date
                  </Label>
                  <Input
                    type="date"
                    name="date"
                    id="date"
                    value={searchCriteria.date}
                    onChange={handleSearchChange}
                    className="form-input"
                  />
                </FormGroup>
                <div className="flex items-end">
                  <Button
                    type="submit"
                    color="danger"
                    className="w-full md:w-auto flex items-center justify-center"
                  >
                    <span className="flex items-center w-full justify-center">
                      <FiSearch className="mr-2" />
                      <span>Search</span>
                    </span>
                  </Button>
                </div>
              </div>
            </Form>
          )}

          {loading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {[
                        "Order Number",
                        "Products",
                        "Note",
                        "Total Price",
                        "Payment",
                        "Customer",
                        "Time",
                        "",
                      ].map((header) => (
                        <th
                          key={header}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tableData.map((order) => (
                      <tr key={order.orderNumber} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{order.orderNumber}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {order.products.map((product) => (
                            <div key={product.productId?._id}>
                              {product.productId?.name}{" "}
                              <span className="text-red-600">
                                x{product.quantity}
                              </span>
                            </div>
                          ))}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {order.delivery.note || "-"}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {order.totalPrice}€
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {order.payment === "Barzahlung" ? (
                            <>
                              <img
                                className="w-6"
                                src={cashLogo}
                                alt="payment"
                              />
                            </>
                          ) : (
                            order.payment
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {order.customer.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDate(order.time)}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          <Link
                            to={`/orders/${order.orderNumber}`}
                            className="text-red-600 hover:text-red-900"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between mt-6">
                <div className="text-sm md:text-xl font-semibold text-gray-700">
                  Total Orders:{" "}
                  <span className="font-bold text-red-600">{totalItems}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    color="light"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                  >
                    <FiChevronLeft />
                  </Button>
                  <span className="text-sm text-gray-700 inline-flex items-center">
                    <span className="flex items-center">
                      <span>Page</span>{" "}
                      <span className="mx-1 text-main font-semibold">
                        {currentPage}
                      </span>{" "}
                      <span>of</span>{" "}
                      <span className="mx-1 text-main font-semibold">
                        {totalPages}
                      </span>
                    </span>
                  </span>
                  <Button
                    color="light"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                  >
                    <FiChevronRight />
                  </Button>
                  <select
                    value={itemsPerPage}
                    onChange={handleItemsPerPageChange}
                    className="form-select text-sm"
                  >
                    {[5, 10, 20, 50].map((value) => (
                      <option key={value} value={value}>
                        {value} per page
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default Orders;
