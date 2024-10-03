import React from 'react';
import { Row, Col } from 'reactstrap';
import SalesChart from './SalesChart';
import ProjectTables from './ProjectTables';
import TodaysOrders from './TodaysOrders';

const Sales = () => {
  return (
    <div className="p-4 bg-gray-50">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Sales</h2>
          <SalesChart />
      {/* <Row className="mb-4">
        <Col lg="8" className="mb-4 lg:mb-0">
        </Col>
        <Col lg="4">
          <TodaysOrders />
        </Col>
      </Row> */}
      {/* <Row>
        <Col lg="12">
          <ProjectTables />
        </Col>
      </Row> */}
    </div>
  );
};

export default Sales;