const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const watchlistRoutes = require("./routes/watchlist");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.json({ message: "Family Movie Watchlist API" }));

app.use("/api/auth", authRoutes);
app.use("/api/watchlist", watchlistRoutes);

// Keep malformed JSON bodies from crashing the process
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON body." });
  }
  console.error(err);
  return res.status(500).json({ error: "Internal server error." });
});

const PORT = process.env.PORT || 3000;

// Only listen when run directly, so test runners can import the app
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
}

module.exports = app;
