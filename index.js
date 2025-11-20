const express = require("express");
const connectDB = require("./src/config/db");
const userRouter = require("./src/routes/userRoute");
const cookieParser = require("cookie-parser");
const blogRouter = require("./src/routes/blogRoute");
const supporRouter = require("./src/routes/supportRoute");
const cors = require("cors");
const app = express();
require('dotenv').config();

app.use(cors({
  origin: "http://localhost:5173", 
  credentials: true,              
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));


app.use(express.json());
app.use(cookieParser());

app.use("/", userRouter);
app.use("/", blogRouter)
app.use("/" , supporRouter);

const PORT = 5000;

(async () => {
    try {
        console.log("Connecting to database...");

        await connectDB();

        console.log("Database connected successfully");

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

    } catch (error) {
        console.error("Database connection failed");
        console.error("Error:", error.message);

    }
})();