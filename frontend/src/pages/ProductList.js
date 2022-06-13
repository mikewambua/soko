import React, { useContext, useEffect, useReducer } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

import getError from '../utils/Utils';
import Spinner from '../components/Spinner';
import Message from '../components/Message';
import { Store } from '../Store';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST': {
      return { ...state, loading: true };
    }
    case 'FETCH_SUCCESS': {
      return {
        ...state,
        products: action.payload.products,
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

const ProductList = () => {
  const [{ loading, error, pages, products }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
  });

  const { search, pathname } = useLocation();
  const searchParams = new URLSearchParams(search);
  const page = searchParams.get('page') || 1;

  const { state } = useContext(Store);
  const { userInfo } = state;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(`/api/products/admin?page=${page}`, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: toast.error(getError(err)) });
      }
    };
    fetchData();
  }, [page, userInfo]);

  return (
    <div>
      {loading ? (
        <Spinner></Spinner>
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <>
          <table className="table">
            <thead>
              <tr>
                <th>Id</th>
                <th>Name</th>
                <th>Price</th>
                <th>Category</th>
                <th>Brand</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td>{product._id}</td>
                  <td>{product.name}</td>
                  <td>{product.price}</td>
                  <td>{product.category}</td>
                  <td>{product.brand}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div>
            {[...Array(pages).keys()].map((item) => (
              <Link
                className={item + 1 === Number(page) ? 'btn text-bold' : 'btn'}
                key={item + 1}
                to={`/admin/products?page=${item + 1}`}
              >
                {item + 1}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ProductList;
