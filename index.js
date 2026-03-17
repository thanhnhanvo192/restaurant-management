const express = require("express"); // Import thư viện Express
require("dotenv").config(); // Load biến môi trường từ file .env
const methodOverride = require("method-override"); // Import thư viện method-override để hỗ trợ HTTP verbs như PUT và DELETE
const bodyParser = require("body-parser"); // Import thư viện body-parser để phân tích cú pháp của request body
const flash = require("express-flash"); // Import thư viện express-flash để hiển thị thông báo flash
const cookieParser = require("cookie-parser"); // Import thư viện cookie-parser để phân tích cookie
const session = require("express-session"); // Import thư viện express-session để quản lý session

const routesAdmin = require("./routes/admin/index.route"); // Import các route cho admin
const routes = require("./routes/clients/index.route"); // Import các route cho client
const systemConfig = require("./configs/system");

const database = require("./configs/database");
database.connect();

const app = express(); // Tạo ứng dụng Express
const port = process.env.PORT;

app.use(methodOverride("_method")); // Sử dụng method-override để hỗ trợ HTTP verbs

app.use(cookieParser("hejhejhej")); // Sử dụng cookie-parser để phân tích cookie
app.use(session({ cookie: { maxAge: 60000 } }));
app.use(flash());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded());

app.set("views", `${__dirname}/views`); // Khai báo thư mục chứa các file giao diện
app.set("view engine", "pug"); // Thiết lập Pug làm template engine

// App local variables
app.locals.prefixAdmin = systemConfig.prefixAdmin;

// Routes
routesAdmin(app);
routes(app);

app.use(express.static(`${__dirname}/public`)); // Thiết lập thư mục chứa file tĩnh

// Start server
app.listen(port, () => {
  console.log(`App is listening on ${port}`);
});

// module.exports = app;
