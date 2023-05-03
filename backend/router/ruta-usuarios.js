const express = require("express");
const Usuario = require("../models/model-usuario");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const checkAuth = require("../middleware/checkAuth");
const router = express.Router();
const cors = require("cors");
require("dotenv").config();

router.use(cors());

// * Crear nuevo usuario
router.post("/registro", async (req, res, next) => {
  const { nombre, email, password } = req.body;
  let existeUsuario;
  try {
    existeUsuario = await Usuario.findOne({
      email: email,
    });
  } catch (err) {
    const error = new Error("Error 1");
    error.code = 500;
    return next(error);
  }
  if (existeUsuario) {
    const error = new Error("Ya existe un usuario con ese e-mail.");
    error.code = 401;
    return next(error);
  } else {
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 12); // ? Método que produce la encriptación
    } catch (error) {
      const err = new Error(
        "No se ha podido crear usuario. Inténtelo de nuevo"
      );
      err.code = 500;
      return next(err);
    }
    const nuevoUsuario = new Usuario({
      nombre,
      email,
      password: hashedPassword,
    });
    try {
      await nuevoUsuario.save();
    } catch (error) {
      const err = new Error("No se han podido guardar los datos");
      err.code = 500;
      return next();
    }
    try {
      token = jwt.sign(
        {
          userId: nuevoUsuario.id,
          email: nuevoUsuario.email,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "1h",
        }
      );
    } catch (error) {
      const err = new Error("No se ha podido crear el token");
      err.code = 500;
      return next(err);
    }

    if (!token) {
      const error = new Error("No se ha podido crear el token");
      error.code = 500;
      return next(error);
    }

    res.status(201).json({
      userId: nuevoUsuario.id,
      email: nuevoUsuario.email,
      token: token,
    });
  }
});

//*------------------LOGIN------------------*//

router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  let usuarioExiste;
  try {
    usuarioExiste = await Usuario.findOne({ email: email });
  } catch (err) {
    const error = new Error("Error 1");
    error.code = 401;
    return next(error);
  }
  if (!usuarioExiste) {
    const error = new Error("No existe ningún usuario con ese e-mail.");
    error.code = 401;
    return next(error);
  } else {
    let passwordValida = false;
    try {
      passwordValida = await bcrypt.compare(password, usuarioExiste.password);
    } catch (err) {
      const error = new Error("Error 2");
      error.code = 401;
      return next(error);
    }
    if (!passwordValida) {
      const error = new Error("La contraseña no es válida.");
      error.code = 401;
      return next(error);
    } else {
      let token;
      try {
        token = jwt.sign(
          {
            userId: usuarioExiste.id,
            email: usuarioExiste.email,
          },
          process.env.JWT_SECRET,
          {
            expiresIn: "10h",
          }
        );
      } catch (err) {
        const error = new Error("Error 3");
        error.code = 401;
        return next(error);
      }
      res.json({
        userId: usuarioExiste.id,
        email: usuarioExiste.email,
        token: token,
      });
    }
  }
});
router.use(checkAuth);

//*-----------------ELIMINAR USUARIO------------------*//
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

router.get("/", async (req, res, next) => {
  try {
    const usuarios = await Usuario.find().populate("casas");
    res.json({ usuarios });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
