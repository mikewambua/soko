import express from 'express';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import data from '../data.js';

const seedRouter = express.Router();

seedRouter.get('/', async (req, res) => {
  await Product.remove({});
  const createProducts = await Product.insertMany(data.products);

  await User.remove({});
  const createUsers = await User.insertMany(data.users);
  res.send({ createProducts, createUsers });
});

export default seedRouter;
