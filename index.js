const express = require("express");
const app = express();

const userRoutes = require("./routes/user.routes.js");
const authRoutes = require("./routes/auth.routes.js");

console.log("auth file imported");

app.use(express.json());

// routes
app.use("/api", userRoutes);
app.use("/api", authRoutes);

// route test
app.get("/", (req, res) => {
  res.send("API OK ");
});

// routes inconnues (404)
app.use((req, res) => {
  res.status(404).json({
    status: 404,
    error: "Not Found",
    message: "Route does not exist"
  });
});

//  middleware erreurs (TOUJOURS EN DERNIER)
app.use((err, req, res, next) => {
  console.error(" ERROR:", err.message);

  res.status(err.status || 500).json({
    status: err.status || 500,
    error: err.name || "Error",
    message: err.message || "Internal Server Error"
  });
});

app.listen(3000, () => {
  console.log("Server running");
});