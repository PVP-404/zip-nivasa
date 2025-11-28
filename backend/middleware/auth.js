import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : header;

    if (!token)
      return res.status(401).json({ success: false, message: "Unauthorized: token missing" });

    if (!process.env.JWT_SECRET)
      return res.status(500).json({ success: false, message: "JWT_SECRET missing on server" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};
