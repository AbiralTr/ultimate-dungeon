import jwt from "jsonwebtoken";

export function requirePageUser(req, res, next) {
  const token = req.cookies?.dungeon_token;
  if (!token) {
    return res.redirect("/login");
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
    return next();
  } catch {

    res.clearCookie("dungeon_token");
    return res.redirect("/login");
  }
}
