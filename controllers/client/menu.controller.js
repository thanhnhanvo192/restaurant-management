const Product = require("../../models/product.model");

// [GET] /menu
module.exports.index = async (req, res) => {
  res.render("client/pages/menu/index", {
    pageTitle: "Thực đơn",
  });
};
