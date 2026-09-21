export function authorizeModification(req, res, next) {
  const { role, id } = req.user;
  const targetUserId = req.params.userId;

  const isParent = role === "parent";
  const isChildOnOwnWatchlist =
    role === "child" && String(targetUserId) === String(id);

  if (isParent || isChildOnOwnWatchlist) {
    return next();
  }

  return res.status(403).json({ error: "Access denied" });
}
