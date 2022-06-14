import React, { useContext, useEffect, useReducer, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet-async';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import { Store } from '../Store';
import getError from '../utils/Utils';
import Spinner from '../components/Spinner';
import Message from '../components/Message';

const reducer = (action, state) => {
  switch (action.type) {
    case 'FETCH_REQUEST': {
      return { ...state, loading: true };
    }
    case 'FETCH_SUCCESS': {
      return { ...state, loading: false };
    }
    case 'FETCH_FAIL': {
      return { ...state, loading: false, error: action.payload };
    }
    case 'UPDATE_REQUEST': {
      return { ...state, loadingUpdate: true };
    }
    case 'UPDATE_SUCCESS': {
      return { ...state, loadingUpdate: false };
    }
    case 'UPDATE_FAIL': {
      return { ...state, loadingUpdate: false };
    }
    default:
      return state;
  }
};

const UserEdit = () => {
  const { state } = useContext(Store);
  const { userInfo } = state;

  const params = useParams();
  const { id: userId } = params;
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const [{ loading, error, loadingUpdate }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/users/${userId}`, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        setName(data.name);
        setEmail(data.email);
        setIsAdmin(data.isAdmin);
        dispatch({ type: 'FETCH_SUCCESS' });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };
    fetchData();
  }, [userId, userInfo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch({ type: 'UPDATE_REQUEST' });
      const { data } = await axios.put(
        `/api/users/${userId}`,
        { _id: userId, name, email, isAdmin },
        { headers: { authorization: `Bearer ${userInfo.token}` } }
      );
      toast.success('User updated successfully');
      dispatch({ type: 'UPDATE_SUCCESS', payload: data });
      navigate('/admin/users');
    } catch (err) {
      toast.error(getError(err));
      dispatch({ type: 'UPDATE_FAIL' });
    }
  };
  return (
    <Container className="small-container">
      <Helmet>
        <title>Update User {userId}</title>
      </Helmet>
      <h3>Update User {userId}</h3>
      {loading ? (
        <Spinner></Spinner>
      ) : error ? (
        <Message>{error}</Message>
      ) : (
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="name">
            <Form.Label>Name</Form.Label>
            <Form.Control
              value={name}
              type="text"
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="email">
            <Form.Label>Email</Form.Label>
            <Form.Control
              value={email}
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Check
            className="mb-3"
            id="isAdmin"
            label="isAdmin"
            checked={isAdmin}
            type="checkbox"
            onChange={(e) => setIsAdmin(e.target.checked)}
          />
          <div className="mb-3">
            <Button disabled={loadingUpdate} type="submit">
              Update
            </Button>
            {loadingUpdate && <Spinner></Spinner>}
          </div>
        </Form>
      )}
    </Container>
  );
};

export default UserEdit;
