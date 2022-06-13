import axios from 'axios';
import React, { useEffect, useReducer, useState } from 'react';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import { Helmet } from 'react-helmet-async';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Message from '../components/Message';
import Rating from '../components/Rating';
import SingleProduct from '../components/SingleProduct';
import Spinner from '../components/Spinner';
import getError from '../utils/Utils';
import { LinkContainer } from 'react-router-bootstrap';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST': {
      return { ...state, loading: true };
    }
    case 'FETCH_SUCCESS': {
      return {
        ...state,
        products: action.payload.products,
        countProducts: action.payload.countProducts,
        page: action.payload.page,
        pages: action.payload.pages,
        loading: false,
      };
    }
    case 'FETCH_FAIL': {
      return { ...state, loading: false, error: action.payload };
    }
    default:
      return state;
  }
};

const prices = [
  { name: '$1 to $50', value: '1-50' },
  { name: '$51 to $20', value: '51-200' },
  { name: '$201 to $1000', value: '201-1000' },
];

export const ratings = [
  { name: '4 stars & up', value: 4 },
  { name: '3 stars & up', value: 3 },
  { name: '2 stars & up', value: 2 },
  { name: '1 stars & up', value: 1 },
];

const SearchPage = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const category = searchParams.get('category') || 'all';
  const query = searchParams.get('query') || 'all';
  const price = searchParams.get('price') || 'all';
  const rating = searchParams.get('rating') || 'all';
  const order = searchParams.get('order') || 'newest';
  const page = searchParams.get('page') || 1;

  const [{ loading, error, products, pages, countProducts }, dispatch] =
    useReducer(reducer, { loading: true, error: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(
          `/api/products/search?page=${page}&query=${query}&category=${category}&price=${price}&rating=${rating}&order=${order}`
        );
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: toast.error(getError(err)) });
      }
    };
    fetchData();
  }, [category, order, page, price, query, rating]);

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get(`/api/products/categories`);
        setCategories(data);
      } catch (err) {
        toast.error(getError(err));
      }
    };
    fetchCategories();
  }, [dispatch]);

  const getFilterUrl = (filter) => {
    const filterPage = filter.page || page;
    const filterCategory = filter.category || category;
    const filterQuery = filter.query || query;
    const filterRating = filter.rating || rating;
    const filterPrice = filter.price || price;
    const sortOrder = filter.order || order;

    return `/search?category=${filterCategory}&query=${filterQuery}&price=${filterPrice}&rating=${filterRating}&order=${sortOrder}&page=${filterPage}`;
  };

  return (
    <div>
      <Helmet>
        <title>Search Products</title>
      </Helmet>
      <Row>
        <Col md={3}>
          <h5>Department</h5>
          <div>
            <ul>
              <li>
                <Link
                  className={'all' === category ? 'text-bold' : ''}
                  to={getFilterUrl({ category: 'all' })}
                >
                  Any
                </Link>
              </li>
              {categories.map((cat) => (
                <li key={cat}>
                  <Link
                    className={cat === category ? 'text-bold' : ''}
                    to={getFilterUrl({ category: cat })}
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h5>Price</h5>
            <ul>
              <li>
                <Link
                  className={'all' === price ? 'text-bold' : ''}
                  to={getFilterUrl({ price: 'all' })}
                >
                  Any
                </Link>
              </li>
              {prices.map((p) => (
                <li key={p.value}>
                  <Link
                    className={p === category ? 'text-bold' : ''}
                    to={getFilterUrl({ category: p })}
                  >
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h5>Customer Reviews</h5>
            <ul>
              {ratings.map((rat) => (
                <li key={rat.name}>
                  <Link
                    to={getFilterUrl({ rating: rat.rating })}
                    className={
                      `${rat.rating}` === `${rating}` ? 'text-bold' : ''
                    }
                  >
                    <Rating caption={'  & up'} rating={rat.rating}></Rating>
                  </Link>
                  <Link
                    to={getFilterUrl({ rating: 'all' })}
                    className={rating === 'all' ? 'text-bold' : ''}
                  >
                    <Rating caption={' & up'} rating={0}></Rating>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Col>
        <Col md={9}>
          {loading ? (
            <Spinner />
          ) : error ? (
            <Message variant="danger">{error}</Message>
          ) : (
            <>
              <Row className="justify-content-between mb-3">
                <Col md={6}>
                  <div>
                    {countProducts === 0 ? 'No' : countProducts} Results{' '}
                    {query !== 'all' && ' : ' + query}
                    {category !== 'all' && ' : ' + category}
                    {price !== 'all' && ' : Price ' + price}
                    {rating !== 'all' && ' : Rating ' + rating + ' & up'}
                    {query !== 'all' ||
                    category !== 'all' ||
                    rating !== 'all' ||
                    price !== 'all' ? (
                      <Button
                        variant="light"
                        onClick={() => navigate('/search')}
                      >
                        <i className="fas fa-times-circle"></i>
                      </Button>
                    ) : null}
                  </div>
                </Col>
                <Col className="text-end">
                  Sort by {''}
                  <select
                    value={order}
                    onChange={(e) => {
                      navigate(getFilterUrl({ order: e.target.value }));
                    }}
                  >
                    <option value="newest">Newest Arrivals</option>
                    <option value="lowest">Price: Low to High</option>
                    <option value="highest">Price: High to Low</option>
                    <option value="toprated">Customer Reviews</option>
                  </select>
                </Col>
              </Row>
              {products.length === 0 && <Message>No product</Message>}
              <Row>
                {products.map((product) => (
                  <Col sm={6} lg={4} className="mb-3" key={product._id}>
                    <SingleProduct product={product} />
                  </Col>
                ))}
              </Row>
              <div>
                {[...Array(pages).keys()].map((a) => (
                  <LinkContainer
                    key={a + 1}
                    className="mx-1"
                    to={getFilterUrl({ page: a + 1 })}
                  >
                    <Button
                      className={Number(page) === a + 1 ? 'text-bold' : ''}
                      variant="light"
                    ></Button>
                  </LinkContainer>
                ))}
              </div>
            </>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default SearchPage;
