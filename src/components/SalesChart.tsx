import React, { useEffect, useState } from 'react';
import { Card, CardBody, Row, Col } from 'reactstrap';
import Chart from 'react-apexcharts';

const SalesChart = () => {
  const [salesData, setSalesData] = useState({
    yearTotalSales: 0,
    monthTotalSales: 0,
    weekTotalSales: 0,
    dayTotalSales: 0,
    monthlyOrderTotals: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("https://tastykitchen-backend.vercel.app/orders/sales")
      .then((response) => response.json())
      .then((data) => {
        setSalesData(data);
        setLoading(false);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const options = {
    chart: {
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.9,
        stops: [0, 90, 100]
      },
    },
    colors: ['#ff2929'],
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      labels: {
        style: {
          colors: '#64748b',
          fontSize: '12px',
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: '#64748b',
          fontSize: '12px',
        },
        // formatter: (value) => `€${value.toFixed(0)}`,
        formatter: (value) => `${value}`,
      },
    },
    tooltip: {
      y: {
        // formatter: (value) => `€${value.toFixed(2)}`,
        formatter: (value) => `${value} orders`,
      },
    },
    grid: {
      borderColor: '#e2e8f0',
      strokeDashArray: 4,
    },
    legend: {
      show: false,
    },
  };

  return (
    <Card className="shadow-sm">
      <CardBody>
        {loading ? (
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-40 bg-gray-200 rounded mb-4"></div>
            <div className="h-60 bg-gray-200 rounded"></div>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-semibold mb-4">Sales Summary</h3>
            <div className="bg-main text-white p-4 rounded-lg mb-6">
              <Row>
                <Col md="3" className="mb-4 md:mb-0">
                  <p className="text-sm">Total Sales</p>
                  <p className="text-2xl font-bold">{salesData.yearTotalSales.toFixed(2)}€</p>
                </Col>
                <Col md="3" className="mb-4 md:mb-0">
                  <p className="text-sm">This Month</p>
                  <p className="text-2xl font-bold">{salesData.monthTotalSales.toFixed(2)}€</p>
                </Col>
                <Col md="3" className="mb-4 md:mb-0">
                  <p className="text-sm">This Week</p>
                  <p className="text-2xl font-bold">{salesData.weekTotalSales.toFixed(2)}€</p>
                </Col>
                <Col md="3">
                  <p className="text-sm">Today</p>
                  <p className="text-2xl font-bold">{salesData.dayTotalSales.toFixed(2)}€</p>
                </Col>
              </Row>
            </div>
            <Chart
              options={options}
              series={salesData.monthlyOrderTotals}
              type="area"
              height={320}
            />
          </>
        )}
      </CardBody>
    </Card>
  );
};

export default SalesChart;