import dashboardRoutes from "./dashboard.route.js";
import tableRoutes from "./table.route.js";
import bookingRoutes from "./booking.route.js";
import categoryRoutes from "./category.route.js";
import menuRoutes from "./menu.route.js";
import orderRoutes from "./order.route.js";
import profileRoutes from "./profile.route.js";
import addressRoutes from "./address.route.js";

export default (app) => {
  app.use("/client/dashboard", dashboardRoutes);
  app.use("/client/tables", tableRoutes);
  app.use("/client/bookings", bookingRoutes);
  app.use("/client/categories", categoryRoutes);
  app.use("/client/menus", menuRoutes);
  app.use("/client/orders", orderRoutes);
  app.use("/client/profile", profileRoutes);
  app.use("/client/addresses", addressRoutes);
};
