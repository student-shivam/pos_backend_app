const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const { bgCyan } = require("colors");
require("colors");
const http = require("http");
const { Server } = require("socket.io");
const connectDb = require("./config/config");

//dotenv config
dotenv.config();
//db config
connectDb();

//rest object
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Attach io to app to access it in controllers
app.set("io", io);

//middlwares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }));
app.use(morgan("dev"));

//routes
app.use("/api/items", require("./routes/itemRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/bills", require("./routes/billsRoute"));
app.use("/api/customers", require("./routes/customersRoute"));
app.use("/api/dashboard", require("./routes/dashboardRoute"));
app.use("/api", require("./routes/settingsRoute"));

// Global Error Handler
const errorMiddleware = require("./middlewares/errorMiddleware");
app.use(errorMiddleware);

// Socket.io connection
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // User joins a personal room based on their userId
  socket.on("join", (userId) => {
    if (userId) {
      socket.join(userId);
      console.log(`User ${userId} joined room ${userId}`);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

//port
const PORT = process.env.PORT || 8080;

//listen
server.listen(PORT, () => {
  console.log(`Server Running On Port ${PORT}`.bgCyan.white);
});
