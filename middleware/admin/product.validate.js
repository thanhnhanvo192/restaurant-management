const systemConfig = require("../../configs/system.js");

module.exports.createPost = (req, res, next) => {
  if (!req.body.title) {
    req.flash("error", "Vui lòng nhập tên sản phẩm");
    res.redirect(`${systemConfig.prefixAdmin}/products/create`);
    return;
  }

  next();
};
