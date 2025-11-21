const express = require("express");
const connectDB = require("./src/config/db");
const userRouter = require("./src/routes/userRoute");
const cookieParser = require("cookie-parser");
const blogRouter = require("./src/routes/blogRoute");
const supporRouter = require("./src/routes/supportRoute");
const cors = require("cors");
require("dotenv").config();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://mini-blogjar.netlify.app"   // add your real frontend URL here
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow server-to-server
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("CORS not allowed for this origin: " + origin));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));


app.use(cookieParser());
app.use(express.json());


// Health check route (VERY important)
app.get("/", (req, res) => {
  res.status(200).send("Backend OK");
});

// Routes
app.use("/", userRouter);
app.use("/", blogRouter);
app.use("/", supporRouter);

// PORT from Render
const PORT = process.env.PORT || 3000;

(async () => {
  try {
    console.log("Connecting to database...");
    await connectDB();
    console.log("Database connected successfully");

    console.log("process.env.PORT =", process.env.PORT);

    app.listen(PORT,"0.0.0.0" ,() => {
      console.log(`Server is running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Database connection failed");
    console.error("Error:", error.message);
    process.exit(1);
  }
})();
