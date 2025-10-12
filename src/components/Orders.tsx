import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiDownload,
  FiFilter,
  FiSearch,
  FiChevronRight,
  FiChevronLeft,
  FiEye,
  FiX,
} from "react-icons/fi";
import cashLogo from "../assets/images/cash.png";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { API_BASE_URL } from "../config/api";
import LoadingSpinner from "./LoadingSpinner";

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
    fetchData(currentPage, itemsPerPage, searchCriteria);
  }, [currentPage, itemsPerPage, searchCriteria]);

  const fetchData = (page, limit, criteria) => {
    setLoading(true);
    const query = new URLSearchParams({ page, limit, ...criteria }).toString();

    fetch(`${API_BASE_URL}/orders?${query}`)
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
      const response = await fetch(`${API_BASE_URL}/orders`);
      const result = await response.json();

      const ordersData = result.orders || [];

      if (!Array.isArray(ordersData)) {
        throw new Error("Received data is not in the expected format");
      }

      const worksheet = XLSX.utils.json_to_sheet(
        ordersData.map((order) => ({
          "Order Number": order.orderNumber,
          Customer: order.customer?.name || "N/A",
          "Total Price": order.totalPrice || 0,
          "Payment Method": order.payment || "N/A",
          "Order Date": order.time
            ? new Date(order.time).toLocaleString()
            : "N/A",
          Products: order.products
            ? order.products
                .map(
                  (p) =>
                    `${p.productId?.name || "Unknown"} (x${p.quantity || 0})`
                )
                .join(", ")
            : "N/A",
          Note: order.delivery?.note || "N/A",
        }))
      );

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
      });

      saveAs(
        blob,
        `TastyKitchen_Orders_${new Date().toISOString().split("T")[0]}.xlsx`
      );
    } catch (error) {
      console.error("Error downloading orders:", error);
      alert("An error occurred while downloading orders. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) {
    return (
      <LoadingSpinner fullScreen message="Bestellungen werden geladen..." />
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Alle Bestellungen
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Übersicht aller Bestellungen
        </p>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-lg border border-gray-300 p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${
                showFilters
                  ? "bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <FiFilter size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span>{showFilters ? "Filter ausblenden" : "Filter"}</span>
            </button>
          </div>

          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {isDownloading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Wird heruntergeladen...</span>
              </>
            ) : (
              <>
                <FiDownload size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span>Exportieren</span>
              </>
            )}
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <form
            onSubmit={handleSearchSubmit}
            className="mt-4 pt-4 border-t border-gray-200"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label
                  htmlFor="orderNumber"
                  className="text-xs sm:text-sm font-medium text-gray-700 mb-2 block"
                >
                  Bestellnummer
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    #
                  </span>
                  <input
                    type="text"
                    name="orderNumber"
                    id="orderNumber"
                    value={searchCriteria.orderNumber}
                    onChange={handleSearchChange}
                    placeholder="z.B. 12345"
                    className="w-full pl-7 sm:pl-8 pr-3 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="date"
                  className="text-xs sm:text-sm font-medium text-gray-700 mb-2 block"
                >
                  Datum
                </label>
                <input
                  type="date"
                  name="date"
                  id="date"
                  value={searchCriteria.date}
                  onChange={handleSearchChange}
                  className="w-full px-3 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                />
              </div>

              <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-1">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-sm sm:text-base"
                >
                  <FiSearch size={16} className="sm:w-[18px] sm:h-[18px]" />
                  <span>Suchen</span>
                </button>
                {(searchCriteria.orderNumber || searchCriteria.date) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchCriteria({ orderNumber: "", date: "" });
                      fetchData(1, itemsPerPage, { orderNumber: "", date: "" });
                    }}
                    className="px-3 py-2 sm:py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-all"
                    title="Filter zurücksetzen"
                  >
                    <FiX size={16} className="sm:w-[18px] sm:h-[18px]" />
                  </button>
                )}
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg border border-gray-300 overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "Bestellnummer",
                  "Produkte",
                  "Notiz",
                  "Gesamtpreis",
                  "Bezahlung",
                  "Kunde",
                  "Zeit",
                  "",
                ].map((header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tableData.map((order) => (
                <tr
                  key={order.orderNumber}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-primary-600">
                      #{order.orderNumber}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 space-y-1">
                      {order.products.map((product) => (
                        <div
                          key={product.productId?._id}
                          className="flex items-center gap-2"
                        >
                          <span>{product.productId?.name}</span>
                          <span className="text-primary-600 font-semibold">
                            x{product.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                    {order.delivery.note || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-gray-900">
                      €{order.totalPrice}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.payment === "Barzahlung" ? (
                      <img
                        className="w-6 h-6"
                        src={cashLogo}
                        alt="Barzahlung"
                      />
                    ) : (
                      order.payment
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.customer.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(order.time)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      to={`/orders/${order.orderNumber}`}
                      className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 font-semibold"
                    >
                      <span>Details</span>
                      <FiEye size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden divide-y divide-gray-200">
          {tableData.map((order) => (
            <div
              key={order.orderNumber}
              className="p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-lg font-bold text-primary-600">
                    #{order.orderNumber}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(order.time)}
                  </p>
                </div>
                <Link
                  to={`/orders/${order.orderNumber}`}
                  className="flex items-center gap-1 text-primary-600 hover:text-primary-700 font-semibold text-sm px-3 py-1.5 bg-primary-50 rounded-lg"
                >
                  <span>Details</span>
                  <FiChevronRight size={14} />
                </Link>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Kunde:</span>
                  <span className="font-medium text-gray-900">
                    {order.customer.name}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Gesamtpreis:</span>
                  <span className="font-bold text-gray-900">
                    €{order.totalPrice}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Bezahlung:</span>
                  <span className="font-medium text-gray-900">
                    {order.payment === "Barzahlung" ? (
                      <img
                        className="w-5 h-5 inline"
                        src={cashLogo}
                        alt="Barzahlung"
                      />
                    ) : (
                      order.payment
                    )}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-2">
                <p className="text-xs font-semibold text-gray-600 mb-1.5">
                  Produkte:
                </p>
                <div className="space-y-1">
                  {order.products.map((product) => (
                    <div
                      key={product.productId?._id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-gray-700">
                        {product.productId?.name}
                      </span>
                      <span className="text-primary-600 font-semibold">
                        x{product.quantity}
                      </span>
                    </div>
                  ))}
                </div>
                {order.delivery.note && (
                  <div className="mt-2 p-2 bg-yellow-50 rounded text-xs text-gray-600">
                    <strong>Notiz:</strong> {order.delivery.note}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-3 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-200 gap-3 sm:gap-4">
          <div className="text-xs sm:text-sm font-medium text-gray-700">
            Gesamt:{" "}
            <span className="font-bold text-primary-600">{totalItems}</span>{" "}
            Bestellungen
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
              >
                <FiChevronLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
              </button>

              <span className="text-xs sm:text-sm text-gray-700 px-2 sm:px-3 whitespace-nowrap">
                Seite{" "}
                <span className="font-semibold text-primary-600">
                  {currentPage}
                </span>{" "}
                von{" "}
                <span className="font-semibold text-primary-600">
                  {totalPages}
                </span>
              </span>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
              >
                <FiChevronRight size={16} className="sm:w-[18px] sm:h-[18px]" />
              </button>
            </div>

            <select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="w-full sm:w-auto sm:ml-2 px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-xs sm:text-sm"
            >
              {[5, 10, 20, 50].map((value) => (
                <option key={value} value={value}>
                  {value} pro Seite
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;
