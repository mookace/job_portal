const jwt = require("jsonwebtoken");
const pool = require("../dbconfig/dbconfig");
const multer = require("multer");
const path = require("path");

const authMiddleware = {};

authMiddleware.authentication = async (req, res, next) => {
  try {
    let token =
      req.body.token ||
      req.query.token ||
      req.headers["x-access-token"] ||
      req.headers.authorization ||
      req.headers.token ||
      req.cookies.accessToken;

    if (token && token.length) {
      token = token.replace("Bearer ", "");
      const d = await jwt.verify(token, process.env.JWT_SEC);
      await pool.query("update users set is_active='true' where id=$1", [d.id]);
      req.user = d;
      return next();
    }
    return res.status(401).json({ message: "You are not authenticated!" });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

authMiddleware.authenticationForLogout = async (req, res, next) => {
  try {
    let token =
      req.body.token ||
      req.query.token ||
      req.headers["x-access-token"] ||
      req.headers.authorization ||
      req.headers.token ||
      req.cookies.accessToken;

    if (token && token.length) {
      token = token.replace("Bearer ", "");
      const d = await jwt.verify(token, process.env.JWT_SEC);
      req.user = d;
      return next();
    }
    return res.status(401).json({ message: "Token Not Found!" });
  } catch (err) {
    return res.status(500).send({ message: err });
  }
};

authMiddleware.authorizationForAdmin = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).send({ message: "User Information Not found" });
    }
    const role = await pool.query("select * from users where id=$1", [user.id]);
    if (role.rows[0].role == "admin" && role.rows[0]) {
      return next();
    }
    return res.status(401).send({ message: "Action not allowed for you" });
  } catch (err) {
    return res.status(500).send({ message: "authorization error" });
  }
};

authMiddleware.authorizationForUser = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).send({ message: "User Information Not found" });
    }
    const role = await pool.query("select * from users where id=$1", [user.id]);
    if (role.rows[0].role == "admin" || role.rows[0].role == "users") {
      return next();
    }
    return res.status(401).send({ message: "Action not allowed for you" });
  } catch (err) {
    return res.status(500).send({ message: "authorization error" });
  }
};

// Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../public/cv"));
  },
  filename: (req, file, cb) => {
    let filename = Date.now() + "--" + file.originalname;
    req.filename = filename;
    cb(null, filename);
  },
});

authMiddleware.upload = multer({
  storage: storage,
  limits: {
    fileSize: 1 * 1024 * 1024, // 1 Mb
  },
}).single("cv");

// End of Multer

module.exports = authMiddleware;
