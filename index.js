const express = require("express");
const connectDB = require("./src/config/db");
const userRouter = require("./src/routes/userRoute");
const cookieParser = require("cookie-parser");
const blogRouter = require("./src/routes/blogRoute");
const supporRouter = require("./src/routes/supportRoute");
const cors = require("cors");
require("dotenv").config();

const app = express();


const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:3000,https://mini-blogjar.netlify.app")
  .split(",")
  .map(s => s.trim());

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("CORS: Origin not allowed - " + origin));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept", "X-Requested-With"],
  exposedHeaders: ["Set-Cookie"]
};


app.use(cors(corsOptions));
app.options("*", cors(corsOptions));


app.use(cookieParser());
app.use(express.json());


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

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Database connection failed");
    console.error("Error:", error.message);
    process.exit(1);
  }
})();
