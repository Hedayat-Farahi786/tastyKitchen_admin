import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { API_BASE_URL } from "../config/api";
import { FiTrendingUp, FiCalendar, FiBarChart2 } from "react-icons/fi";

const SalesChart = () => {
  const [salesData, setSalesData] = useState({
    yearTotalSales: 0,
    monthTotalSales: 0,
    weekTotalSales: 0,
    dayTotalSales: 0,
    monthlyOrderTotals: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/orders/sales`)
      .then((response) => response.json())
      .then((data) => {
        setSalesData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, []);

  const options = {
    chart: {
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: "11px",
        fontWeight: 600,
        colors: ["#e53935"],
      },
    },
    stroke: { curve: "smooth" as const, width: 3 },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.5,
        opacityTo: 0.1,
        stops: [0, 90, 100],
      },
    },
    colors: ["#e53935"],
    xaxis: {
      categories: [
        "Jan",
        "Feb",
        "Mär",
        "Apr",
        "Mai",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Okt",
        "Nov",
        "Dez",
      ],
      labels: {
        style: {
          colors: "#64748b",
          fontSize: "13px",
          fontWeight: 600,
        },
      },
      title: {
        text: "Monat",
        style: {
          fontSize: "14px",
          fontWeight: 600,
          color: "#475569",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#64748b",
          fontSize: "13px",
          fontWeight: 600,
        },
        formatter: (value: number) => `${Math.round(value)}`,
      },
      title: {
        text: "Anzahl Bestellungen",
        style: {
          fontSize: "14px",
          fontWeight: 600,
          color: "#475569",
        },
      },
    },
    tooltip: {
      y: {
        formatter: (value: number) => `${value} Bestellungen`,
        title: {
          formatter: () => "",
        },
      },
      style: {
        fontSize: "14px",
      },
    },
    grid: {
      borderColor: "#e2e8f0",
      strokeDashArray: 4,
      padding: {
        top: 0,
        right: 10,
        bottom: 0,
        left: 10,
      },
    },
    legend: {
      show: false,
    },
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Verkäufe & Umsatz
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Übersicht über Ihre Verkäufe und Einnahmen
        </p>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-28 sm:h-32 bg-gray-200 rounded-lg"
              ></div>
            ))}
          </div>
          <div className="h-80 sm:h-96 bg-gray-200 rounded-lg"></div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Today */}
            <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg p-4 sm:p-5 shadow-md hover:shadow-lg transition-all duration-300 text-white">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <FiCalendar className="w-5 h-5 sm:w-6 sm:h-6 opacity-80" />
                <div className="bg-white bg-opacity-20 px-2 py-1 rounded text-xs font-semibold text-main">
                  Heute
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold mb-1">
                €{salesData.dayTotalSales.toFixed(2)}
              </p>
              <p className="text-primary-100 text-xs sm:text-sm">Tagesumsatz</p>
            </div>

            {/* This Week */}
            <div className="bg-white rounded-lg border border-gray-300 p-4 sm:p-5 hover:border-primary-300 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <FiBarChart2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
                <div className="bg-primary-50 px-2 py-1 rounded text-xs font-semibold text-primary-600">
                  Woche
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                €{salesData.weekTotalSales.toFixed(2)}
              </p>
              <p className="text-gray-600 text-xs sm:text-sm">Wochenumsatz</p>
            </div>

            {/* This Month */}
            <div className="bg-white rounded-lg border border-gray-300 p-4 sm:p-5 hover:border-primary-300 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <FiTrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
                <div className="bg-primary-50 px-2 py-1 rounded text-xs font-semibold text-primary-600">
                  Monat
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                €{salesData.monthTotalSales.toFixed(2)}
              </p>
              <p className="text-gray-600 text-xs sm:text-sm">Monatsumsatz</p>
            </div>

            {/* Total Year */}
            <div className="bg-white rounded-lg border border-gray-300 p-4 sm:p-5 hover:border-primary-300 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <FiTrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
                <div className="bg-primary-50 px-2 py-1 rounded text-xs font-semibold text-primary-600">
                  Jahr
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                €{salesData.yearTotalSales.toFixed(2)}
              </p>
              <p className="text-gray-600 text-xs sm:text-sm">Jahresumsatz</p>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white rounded-lg border border-gray-300 p-4 sm:p-6 shadow-sm">
            <div className="mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                Bestellungen pro Monat
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm">
                Anzahl der Bestellungen in diesem Jahr
              </p>
            </div>
            <div className="mt-4 -mx-2 sm:mx-0">
              <Chart
                options={options}
                series={salesData.monthlyOrderTotals}
                type="area"
                height={window.innerWidth < 640 ? 300 : 400}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SalesChart;
