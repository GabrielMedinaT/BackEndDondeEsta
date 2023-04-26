const express = require("express");
const Usuario = require("../models/model-usuario");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const checkAuth = require("../middleware/checkAuth");
const router = express.Router();
const cors = require("cors");

router.use(cors());

router.get("/", async (req, res, next) => {
  try {
    const usuarios = await Usuario.find().populate("casas");
    res.json({ usuarios });
  } catch (err) {
    return next(err);
  }
});

router.post("/registro", async (req, res, next) => {
  const { nombre, email, password } = req.body;

  try {
    const existeUsuario = await Usuario.findOne({ email });

    if (existeUsuario) {
      return res.status(409).json({ message: "El correo ya está registrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const usuario = new Usuario({ nombre, email, password: hashedPassword });
    const usuarioGuardado = await usuario.save();

    const token = jwt.sign(
      { userId: usuarioGuardado._id, email: usuarioGuardado.email },
      "clave-secreta",
      { expiresIn: "1h" }
    );

    res.status(201).json({ usuario: usuarioGuardado, token });
  } catch (err) {
    return next(err);
  }
});

router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const existeUsuario = await Usuario.findOne({ email });
    if (!existeUsuario) {
      return res.status(401).json({
        message: "No existe el usuario o la contraseña es incorrecta",
      });
    }
    const passwordCorrecto = bcrypt.compareSync(
      password,
      existeUsuario.password
    );
    if (!passwordCorrecto) {
      return res.status(401).json({
        message: "No existe el usuario o la contraseña es incorrecta",
      });
    }
    const token = jwt.sign(
      { usuarioId: existeUsuario._id, email: existeUsuario.email },
      "clave-secreta",
      { expiresIn: "1h" }
    );
    res.status(200).json({ usuario: existeUsuario, token });
  } catch (err) {
    return next(err);
  }
});

router.delete("/borrar/:email", async (req, res, next) => {
  try {
    const usuario = await Usuario.findOneAndDelete({ email: req.params.email });
    if (!usuario) {
      return res.status(404).json({ message: "No existe el usuario" });
    }
    res.json({ message: "Usuario borrado" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
