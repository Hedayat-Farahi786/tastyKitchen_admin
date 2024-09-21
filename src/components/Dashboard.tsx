import React from 'react';
import { Row, Col } from 'reactstrap';
import SalesChart from './SalesChart';
import ProjectTables from './ProjectTables';
import TodaysOrders from './TodaysOrders';

const Dashboard = () => {
  return (
    <div className="p-4 bg-gray-50">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Dashboard</h2>
      <Row className="mb-4">
        <Col lg="8" className="mb-4 lg:mb-0">
          <SalesChart />
        </Col>
        <Col lg="4">
          <TodaysOrders />
        </Col>
      </Row>
      {/* <Row>
        <Col lg="12">
          <ProjectTables />
        </Col>
      </Row> */}
    </div>
  );
};

export default Dashboard;