import tableRoutes from "./table.route.js";
import dashboardRoutes from "./dashboard.route.js";
import menuRoutes from "./menu.route.js";
import staffRoutes from "./staff.route.js";
import customerRoutes from "./customer.route.js";
import orderRoutes from "./order.route.js";
import statisticsRoutes from "./statistic.route.js";
import {
  authorizeAdminRoles,
  requireAdminAuth,
} from "../../middlewares/auth.middleware.js";

export default (app) => {
  app.use(
    "/admin/tables",
    requireAdminAuth,
    authorizeAdminRoles("admin", "waiter"),
    tableRoutes,
  );
  app.use(
    "/admin/dashboard",
    requireAdminAuth,
    authorizeAdminRoles("admin"),
    dashboardRoutes,
  );
  app.use(
    "/admin/menus",
    requireAdminAuth,
    authorizeAdminRoles("admin", "kitchen"),
    menuRoutes,
  );
  app.use(
    "/admin/staffs",
    requireAdminAuth,
    authorizeAdminRoles("admin"),
    staffRoutes,
  );
  app.use(
    "/admin/customers",
    requireAdminAuth,
    authorizeAdminRoles("admin", "waiter"),
    customerRoutes,
  );
  app.use(
    "/admin/orders",
    requireAdminAuth,
    authorizeAdminRoles("admin", "waiter", "kitchen"),
    orderRoutes,
  );
  app.use(
    "/admin/statistics",
    requireAdminAuth,
    authorizeAdminRoles("admin"),
    statisticsRoutes,
  );
};
