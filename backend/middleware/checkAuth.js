const autorizacion = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No autorizado" });
    }
    const token = authHeader.split(" ")[1];
    const decodedToken = jwt.verify(token, "clave-secreta");
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
