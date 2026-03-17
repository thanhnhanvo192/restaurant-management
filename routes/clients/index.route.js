const homeRoutes = require("./home.route");
const menuRoutes = require("./menu.route");

module.exports = (app) => {
  app.use("/", homeRoutes);
  app.use("/menu", menuRoutes);
};
