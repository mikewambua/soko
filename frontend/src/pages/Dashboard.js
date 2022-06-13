import React, { useContext, useEffect, useReducer } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Chart from 'react-google-charts';
import getError from '../utils/Utils';
import { Store } from '../Store';
import Spinner from '../components/Spinner';
import Message from '../components/Message';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST': {
      return { ...state, loading: true };
    }
    case 'FETCH_SUCCESS': {
      return { ...state, summary: action.payload, loading: false };
    }
    case 'FETCH_FAIL': {
      return { ...state, loading: false, error: action.payload };
    }
    default:
      return state;
  }
};

const Dashboard = () => {
  const [{ loading, summary, error }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
  });

  const { state } = useContext(Store);
  const { userInfo } = state;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get('/api/orders/summary', {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        console.log(data);
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: toast.error(getError(err)) });
      }
    };
    fetchData();
  }, [userInfo]);
  return (
    <div>
      <h3>Welcome to dashboard</h3>
      {loading ? (
        <Spinner />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <>
          <Row>
            <Col md={4}>
              <Card>
                <Card.Body>
                  <Card.Title>
                    {summary.users && summary.users[0]
                      ? summary.users[0].numUsers
                      : 0}
                  </Card.Title>
                  <Card.Text>Users</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card>
                <Card.Body>
                  <Card.Title>
                    {summary.orders && summary.users[0]
                      ? summary.orders[0].numOrders
                      : 0}
                  </Card.Title>
                  <Card.Text>Orders</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card>
                <Card.Body>
                  <Card.Title>
                    {summary.orders && summary.users[0]
                      ? summary.orders[0].totalSales.toFixed(2)
                      : 0}
                  </Card.Title>
                  <Card.Text>Orders</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <div className="my-3">
            <h3>Sales</h3>
            {summary.dailyOrders.length === 0 ? (
              <Message>No sales</Message>
            ) : (
              <Chart
                width="100%"
                height="400px"
                chartType="AreaChart"
                loader={<div>Loading chart...</div>}
                data={[
                  ['Date', 'Sales'],
                  ...summary.dailyOrders.map((item) => [item._id, item.sales]),
                ]}
              ></Chart>
            )}
          </div>
          <div className="my-3">
            <h3>Categories</h3>
            {summary.productCategories.length === 0 ? (
              <Message>No category</Message>
            ) : (
              <Chart
                width="100%"
                height="400px"
                chartType="PieChart"
                loader={<div>Loading chart...</div>}
                data={[
                  ['Category', 'Products'],
                  ...summary.productCategories.map((item) => [
                    item._id,
                    item.count,
                  ]),
                ]}
              ></Chart>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
