const Product = require("../../models/product.model");

// [GET] /products
module.exports.index = async (req, res) => {
  const products = await Product.find({
    status: "active",
    deleted: false,
  }).sort({ position: "desc" });

  const newProducts = products.map((product) => {
    product.priceNew = (
      (product.price * (100 - product.discountPercentage)) /
      100
    ).toFixed(0);
    return product;
  });

  res.render("client/pages/products/index", {
    pageTitle: "Trang sản phẩm",
    products: newProducts,
  });
};

// [GET] /products/:slug
module.exports.detail = async (req, res) => {
  console.log(req.params.slug);
  const product = await Product.findOne({
    slug: req.params.slug,
    status: "active",
    deleted: false,
  });

  res.render("client/pages/products/detail", {
    pageTitle: "Trang chi tiết sản phẩm",
    product: product,
  });
};
