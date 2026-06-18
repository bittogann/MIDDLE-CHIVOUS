// routes/products.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET /api/products — list with filter & sort
router.get('/', async (req, res) => {
  try {
    const { category, minPrice, maxPrice, color, sort, search, limit, page } = req.query;
    const query = {};

    if (category && category !== 'all') {
      query.category = new RegExp(`^${category}$`, 'i');
    }
    if (search) {
      const q = new RegExp(search, 'i');
      query.$or = [{ name: q }, { category: q }];
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (color) {
      const colors = color.split(',');
      query['colors.hex'] = { $in: colors };
    }

    let sortOption = {};
    switch (sort) {
      case 'price-asc': sortOption = { price: 1 }; break;
      case 'price-desc': sortOption = { price: -1 }; break;
      case 'newest': sortOption = { isNewProduct: -1 }; break;
      default: break;
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortOption)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    // Tương thích frontend cũ đang đọc field "isNew"
    const out = products.map(p => {
      const obj = p.toObject();
      obj.isNew = obj.isNewProduct;
      return obj;
    });

    res.json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      products: out
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const param = req.params.id;
    const isNumeric = /^\d+$/.test(param);
    const product = isNumeric
      ? await Product.findOne({ id: parseInt(param) })
      : await Product.findOne({ slug: param });

    if (!product) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm.' });

    const related = await Product.find({ id: { $ne: product.id }, category: product.category }).limit(4);

    const productOut = product.toObject();
    productOut.isNew = productOut.isNewProduct;
    const relatedOut = related.map(p => {
      const obj = p.toObject();
      obj.isNew = obj.isNewProduct;
      return obj;
    });

    res.json({ success: true, product: productOut, related: relatedOut });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;