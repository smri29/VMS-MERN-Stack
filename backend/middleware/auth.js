// backend/middleware/auth.js
import jwt from "jsonwebtoken";
import User from "../models/user_model.js";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).select("-password");
      if (!user) throw new Error("User not found");

      // Store the ID as a string, not an ObjectId instance:
      req.user = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      };

      return next();
    } catch (err) {
      console.error("Auth middleware error:", err);
      return res
        .status(401)
        .json({ success: false, message: "Not authorized: " + err.message });
    }
  }

  return res
    .status(401)
    .json({ success: false, message: "No token provided" });
};
