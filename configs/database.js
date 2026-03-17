const mongoose = require("mongoose"); // Import thư viện Mongoose để kết nối MongoDB
// Kết nối đến MongoDB
module.exports.connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};
