// src/components/Layout.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import {
  FiShoppingCart,
  FiBox,
  FiList,
  FiMessageSquare,
  FiMail,
  FiUsers,
  FiMenu,
  FiX,
  FiChevronDown,
  FiCalendar,
  FiBarChart,
  FiLogOut,
} from "react-icons/fi";
import { decodeToken } from "../helpers/token";
import logo from "../assets/images/logos/logo.png";
import API_BASE_URL from "../config/api";

const Layout = () => {
  const [username, setUsername] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken = decodeToken(token);
      setUsername(decodedToken.username);
    }
  }, []);

  // Fetch pending orders count
  useEffect(() => {
    const fetchPendingOrdersCount = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/orders/today`);
        if (response.ok) {
          const data = await response.json();
          const storedDoneStates = JSON.parse(
            localStorage.getItem("doneOrders") || "{}"
          );
          const pending = Array.isArray(data)
            ? data.filter((order) => !storedDoneStates[order._id]).length
            : 0;
          setPendingOrdersCount(pending);
        }
      } catch (error) {
        console.error("Error fetching pending orders count:", error);
      }
    };

    fetchPendingOrdersCount();
    // Refresh count every 30 seconds
    const interval = setInterval(fetchPendingOrdersCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleDropdown = () => setDropdownOpen((prevState) => !prevState);
  const toggleSidebar = () => setSidebarOpen((prevState) => !prevState);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const navItems = [
    { name: "Heute", path: "/today", icon: FiCalendar },
    { name: "Verkäufe", path: "/sales", icon: FiBarChart },
    { name: "Bestellungen", path: "/orders", icon: FiShoppingCart },
    { name: "Produkte", path: "/products", icon: FiBox },
    { name: "Kategorien", path: "/categories", icon: FiList },
    { name: "Bewertungen", path: "/testimonials", icon: FiMessageSquare },
    { name: "Kontakt", path: "/contact", icon: FiMail },
    { name: "Benutzer", path: "/users", icon: FiUsers },
  ];

  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${day}.${month}.${year} • ${hours}:${minutes}`;
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden transition-opacity duration-300 cursor-pointer"
          onClick={toggleSidebar}
          onKeyDown={(e) => e.key === "Escape" && toggleSidebar()}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`bg-white w-72 sm:w-64 fixed inset-y-0 left-0 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out z-20 shadow-2xl border-r border-gray-100`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-6 border-b border-gray-100">
            <img
              src={logo}
              alt="logo"
              className="w-28 sm:w-36 transition-transform duration-300 hover:scale-105"
            />
            <button
              onClick={toggleSidebar}
              className="md:hidden text-gray-600 hover:text-primary-600 transition-colors duration-200 p-2 hover:bg-gray-100 rounded-lg active:scale-95"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 sm:px-4 py-4 sm:py-6 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const showBadge =
                item.path === "/today" && pendingOrdersCount > 0;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={toggleSidebar}
                  className={`flex items-center py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl transition-all duration-200 no-underline group ${
                    isActive
                      ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30"
                      : "text-gray-700 hover:bg-gradient-to-r hover:from-primary-50 hover:to-red-50 hover:text-primary-600"
                  }`}
                >
                  <item.icon
                    className={`mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 ${isActive ? "animate-pulse" : "group-hover:scale-110 transition-transform duration-200"}`}
                  />
                  <span className="font-medium text-xs sm:text-sm">
                    {item.name}
                  </span>
                  {showBadge && (
                    <span className="ml-auto bg-primary-600 text-white text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full animate-pulse">
                      {pendingOrdersCount}
                    </span>
                  )}
                  {isActive && !showBadge && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer - Subtle Logout */}
          <div className="p-3 sm:p-4 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2 sm:py-2.5 px-3 sm:px-4 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-xs sm:text-sm active:scale-95"
            >
              <FiLogOut className="w-4 h-4" />
              <span>Abmelden</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-100">
          <div className="flex justify-between items-center py-3 sm:py-4 px-3 sm:px-6">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={toggleSidebar}
                className="md:hidden text-gray-600 hover:text-primary-600 transition-colors duration-200 p-2 hover:bg-gray-100 rounded-lg active:scale-95"
              >
                <FiMenu className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>

              {/* Date & Time */}
              <div className="flex items-center space-x-1.5 sm:space-x-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-primary-50 to-red-50 rounded-lg">
                <FiCalendar className="text-primary-600 w-3 h-3 sm:w-4 sm:h-4" />
                <span className="font-medium text-gray-700 text-xs sm:text-sm md:text-base">
                  {formatDateTime(currentDateTime)}
                </span>
              </div>
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="flex items-center space-x-1.5 sm:space-x-3 text-gray-700 hover:bg-gray-50 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl transition-all duration-200 group active:scale-95"
              >
                <div className="relative">
                  <img
                    src={`https://ui-avatars.com/api/?name=${username}&background=e53935&color=fff&bold=true`}
                    alt="User avatar"
                    className="h-7 w-7 sm:h-9 sm:w-9 rounded-full ring-2 ring-primary-100 group-hover:ring-primary-300 transition-all duration-200"
                  />
                  <div className="absolute bottom-0 right-0 w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <span className="font-medium text-xs sm:text-sm hidden sm:block">
                  {username}
                </span>
                <FiChevronDown
                  className={`h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-xl shadow-2xl py-2 z-30 border border-gray-100 animate-scale-in">
                  <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-100">
                    <p className="text-xs sm:text-sm font-semibold text-gray-900">
                      {username}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Administrator</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full text-left px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-700 hover:bg-gradient-to-r hover:from-primary-50 hover:to-red-50 hover:text-primary-600 transition-all duration-200 group"
                  >
                    <FiLogOut className="mr-2 sm:mr-3 h-3.5 w-3.5 sm:h-4 sm:w-4 group-hover:scale-110 transition-transform duration-200" />
                    <span className="font-medium">Abmelden</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100 p-3 sm:p-4 md:p-6">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
