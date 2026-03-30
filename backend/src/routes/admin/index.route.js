import tableRoutes from "./table.route.js";
import dashboardRoutes from "./dashboard.route.js";
import menuRoutes from "./menu.route.js";
import staffRoutes from "./staff.route.js";
import customerRoutes from "./customer.route.js";
import orderRoutes from "./order.route.js";
import statisticsRoutes from "./statistic.route.js";

export default (app) => {
  app.use("/admin/tables", tableRoutes);
  app.use("/admin/dashboard", dashboardRoutes);
  app.use("/admin/menus", menuRoutes);
  app.use("/admin/staffs", staffRoutes);
  app.use("/admin/customers", customerRoutes);
  app.use("/admin/orders", orderRoutes);
  app.use("/admin/statistics", statisticsRoutes);
};
