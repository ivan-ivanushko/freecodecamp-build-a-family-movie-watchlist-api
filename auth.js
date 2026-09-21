import { Router } from "express";
import jwt from "jsonwebtoken";
import { findByUsername } from "../utils/db.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "family_movie_watchlist_secret";

// Import defensively so the server still boots if neither package is installed
let bcrypt = null;
try {
  bcrypt = (await import("bcryptjs")).default;
} catch {
  try {
    bcrypt = (await import("bcrypt")).default;
  } catch {
    bcrypt = null;
  }
}

async function passwordMatches(plain, stored) {
  if (stored === plain) return true; // plain-text password
  if (bcrypt && typeof stored === "string" && /^\$2[aby]\$/.test(stored)) {
    return bcrypt.compare(String(plain), stored); // bcrypt hash
  }
  return false;
}

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body ?? {};

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required." });
    }

    const user = findByUsername(username);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const stored = user.password ?? user.passwordHash;

    if (!(await passwordMatches(password, stored))) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({ token });
  } catch (err) {
    return res.status(500).json({ error: "Login failed." });
  }
});

export default router;
