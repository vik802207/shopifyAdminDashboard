require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
// const getSellerOrders = require("./controllers/seller.controller").getSellerOrders;
const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"));
app.get("/",(req,res)=>{
  res.send("API is running....");
})
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api/seller", require("./routes/seller.routes"));
app.listen(5000, () => {
  console.log("Server running on 5000");
});
