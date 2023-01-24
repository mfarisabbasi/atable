import jwt from "jsonwebtoken";
import crypto from "crypto";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "365d",
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

const generateEmailVerificationToken = () => {
  const token = crypto.randomBytes(32).toString("hex");

  return crypto.createHash("sha256").update(token).digest("hex");
};

export { generateToken, verifyToken, generateEmailVerificationToken };
