import express from "express";
import adminRoutes from "./routes/admin/index.route.js";
import dotenv from "dotenv";
import { connectDB } from "./configs/database.js";
import cors from "cors";

dotenv.config();

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
adminRoutes(app);

app.get("/", (req, res) => {
  res.send("Welcome to the Restaurant Management System API!");
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
