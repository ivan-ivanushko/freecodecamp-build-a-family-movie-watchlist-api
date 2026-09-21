import { Router } from "express";
import {
  getWatchlist,
  addMovie,
  updateMovie,
  deleteMovie,
  findById,
} from "../utils/db.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeModification } from "../middleware/authorize.js";

const router = Router();

// Every watchlist route requires a valid token
router.use(authenticate);

// Normalize id lookups (seed data ids may be numbers or strings)
function findUser(rawId) {
  return findById(rawId) || findById(Number(rawId));
}

function parseMovieId(rawId) {
  const parsed = Number(rawId);
  return Number.isNaN(parsed) ? rawId : parsed;
}

// Any authenticated user can view any watchlist
router.get("/:userId", (req, res) => {
  const user = findUser(req.params.userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  return res.status(200).json(getWatchlist(user.id));
});

router.post("/:userId/movies", authorizeModification, (req, res) => {
  const user = findUser(req.params.userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const { title, genre } = req.body;
  if (!title || !genre) {
    return res.status(400).json({ error: "Title and genre are required." });
  }

  const movie = addMovie(user.id, { title, genre });
  return res.status(201).json(movie);
});

router.put("/:userId/movies/:movieId", authorizeModification, (req, res) => {
  const user = findUser(req.params.userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const movie = updateMovie(user.id, parseMovieId(req.params.movieId), req.body);
  if (!movie) {
    return res.status(404).json({ error: "Movie not found" });
  }
  return res.status(200).json(movie);
});

router.delete("/:userId/movies/:movieId", authorizeModification, (req, res) => {
  const user = findUser(req.params.userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const deleted = deleteMovie(user.id, parseMovieId(req.params.movieId));
  if (!deleted) {
    return res.status(404).json({ error: "Movie not found" });
  }
  return res.status(200).json({ message: "Movie removed from watchlist" });
});

export default router;
