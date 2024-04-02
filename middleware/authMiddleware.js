import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

export const isAdmin = (req, res, next) => {
  // isAdmin middleware logic
  if (req.user.role === "admin") {
    next();
  } else {
    res.status(403).send("Access forbidden");
  }
};

export const isSubAdmin = (req, res, next) => {
  // isSubAdmin middleware logic
  if (req.user.role === "sub-admin") {
    next();
  } else {
    res.status(403).send("Access forbidden");
  }
};
