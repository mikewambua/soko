import React, { useEffect, useReducer } from 'react';
import logger from 'use-reducer-logger';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import axios from 'axios';
import SingleProduct from '../components/SingleProduct';
import { Helmet } from 'react-helmet-async';
import LoadingSpinner from '../components/Spinner';
import Message from '../components/Message';
import getError from '../utils/Utils';
// import data from '../data'

//Using useReducer Hook
const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, products: action.payload, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default function Home() {
  const [{ loading, error, products }, dispatch] = useReducer(logger(reducer), {
    products: [],
    loading: true,
    error: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const result = await axios.get('/api/products');
        dispatch({ type: 'FETCH_SUCCESS', payload: result.data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <Helmet>
        <title>Soko</title>
      </Helmet>
      <h1>Featured Products</h1>
      <div className="products">
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <Message variant="danger">{error}</Message>
        ) : (
          <Row>
            {products?.map((product) => (
              <Col key={product.slug} sm={6} md={4} lg={3} className="mb-3">
                <SingleProduct product={product} />
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
}
