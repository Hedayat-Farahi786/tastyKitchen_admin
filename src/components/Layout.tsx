// src/components/Layout.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { FiHome, FiShoppingCart, FiBox, FiList, FiMessageSquare, FiMail, FiUsers, FiMenu, FiX, FiChevronDown, FiCalendar, FiBarChart } from 'react-icons/fi';
import { decodeToken } from '../helpers/token';
import logo from "../assets/images/logos/logo.png"
import { FaCalendarAlt, FaClock } from 'react-icons/fa';
const Layout = () => {
  const [username, setUsername] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = decodeToken(token);
      setUsername(decodedToken.username);
    }
  }, []);

  const toggleDropdown = () => setDropdownOpen(prevState => !prevState);
  const toggleSidebar = () => setSidebarOpen(prevState => !prevState);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navItems = [
    { name: 'Today', path: '/today', icon: FiCalendar },
    { name: 'Sales', path: '/sales', icon: FiBarChart },
    { name: 'Orders', path: '/orders', icon: FiShoppingCart },
    { name: 'Products', path: '/products', icon: FiBox },
    { name: 'Categories', path: '/categories', icon: FiList },
    { name: 'Testimonials', path: '/testimonials', icon: FiMessageSquare },
    { name: 'Contact', path: '/contact', icon: FiMail },
    { name: 'Users', path: '/users', icon: FiUsers },
  ];


  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1; // Months are zero-indexed
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`bg-white text-gray-800 w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition duration-200 ease-in-out z-20 shadow-lg`}>
        <div className="flex items-center justify-between px-4 mb-10">
          <img src={logo} alt="logo" className='w-40' />
          <button onClick={toggleSidebar} className="md:hidden text-gray-800">
            <FiX className="h-6 w-6" />
          </button>
        </div>
        <nav className="mt-20 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              onClick={toggleSidebar}
              className={`flex items-center py-2.5 px-4 rounded transition duration-200 no-underline ${
                location.pathname === item.path
                  ? 'bg-red-50 text-red-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-red-600'
              }`}
            >
              <item.icon className="mr-3 h-5 w-5" />
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="flex justify-between items-center py-3 px-4">
            <button onClick={toggleSidebar} className="md:hidden text-gray-800">
              <FiMenu className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-4 text-sm md:text-lg ml-5 md:ml-0">
      {/* Date Icon */}
      <span className="flex items-center space-x-2">
        <FaCalendarAlt className="text-red-500" />
        <span>{formatDateTime(currentDateTime).split(' ')[0]}</span> {/* Date */}
      </span>

      {/* Time Icon */}
      <span className="flex items-center space-x-2">
        <FaClock className="text-red-500" />
        <span>{formatDateTime(currentDateTime).split(' ')[1]}</span> {/* Time */}
      </span>
    </div>
            <div className="relative">
              <button onClick={toggleDropdown} className="flex items-center space-x-2 text-gray-700 focus:outline-none">
                <img
                  src={`https://ui-avatars.com/api/?name=${username}&background=random`}
                  alt="User avatar"
                  className="h-8 w-8 rounded-full"
                />
                <span className="font-medium text-sm hidden md:flex">{username}</span>
                <FiChevronDown className={`h-4 w-4 transition-transform duration-200 ${dropdownOpen ? 'transform rotate-180' : ''}`} />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;