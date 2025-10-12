// src/components/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Spinner } from "reactstrap";
import { IoMdLogIn } from "react-icons/io";
import { FiMail, FiLock } from "react-icons/fi";
import logo from "../assets/images/logos/logo.png";
import { API_BASE_URL } from "../config/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        username: email,
        password,
      });
      const { token } = response.data;
      localStorage.setItem("token", token);
      toast.success("Anmeldung erfolgreich! Willkommen zurück!");
      setTimeout(() => navigate("/today"), 500);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response &&
        error.response.data &&
        typeof error.response.data === "object" &&
        "message" in error.response.data
          ? String(error.response.data.message)
          : "Anmeldung fehlgeschlagen. Bitte überprüfen Sie Ihre Anmeldedaten.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-gold-50 py-6 px-4 sm:py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gold-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float-delayed"></div>
      </div>

      <div className="max-w-md w-full space-y-6 sm:space-y-8 relative z-10">
        {/* Logo & Header */}
        <div className="text-center animate-slide-down">
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <img
              src={logo}
              className="w-36 sm:w-48 transition-all duration-300 hover:scale-105"
              alt="logo"
            />
          </div>
          <h2 className="mt-4 sm:mt-6 text-2xl sm:text-4xl font-bold text-gray-900">
            Admin-Portal
          </h2>
          <p className="mt-2 sm:mt-3 text-sm sm:text-base text-gray-600 font-medium px-4">
            Melden Sie sich an, um Ihr Restaurant zu verwalten
          </p>
        </div>

        {/* Login Form */}
        <form
          className="mt-6 sm:mt-8 space-y-4 sm:space-y-6 animate-scale-in"
          onSubmit={handleSubmit}
        >
          <div className="space-y-3 sm:space-y-4">
            {/* Email Input */}
            <div className="relative">
              <label
                htmlFor="email"
                className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2"
              >
                E-Mail-Adresse
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none z-10">
                  <FiMail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@tastykitchen.com"
                  disabled={loading}
                  className="appearance-none relative block w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:border-primary-300"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="relative">
              <label
                htmlFor="password"
                className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2"
              >
                Passwort
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none z-10">
                  <FiLock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </span>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  className="appearance-none relative block w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:border-primary-300"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center items-center gap-2 py-3 sm:py-3.5 px-4 border border-transparent text-sm sm:text-base font-semibold rounded-xl text-white bg-gradient-to-r from-primary-500 to-primary-700 hover:from-primary-600 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            {loading ? (
              <>
                <Spinner size="sm" />
                <span>Anmeldung läuft...</span>
              </>
            ) : (
              <>
                <IoMdLogIn className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Anmelden</span>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-xs sm:text-sm text-gray-500 animate-fade-in px-4">
          <p>
            © {new Date().getFullYear()} Tasty Kitchen. Alle Rechte
            vorbehalten.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
