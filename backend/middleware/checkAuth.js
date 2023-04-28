const jwt = require("jsonwebtoken");
const autorizacion = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No autorizado" });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    req.datosUsuario = {
      userId: decodedToken.userId,
      token: token,
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "No autorizado 2" });
  }
};

module.exports = autorizacion;
