const mongoose = require("mongoose");
const Cajon = require("../models/model-cajon");
const Casa = require("../models/model-casa");
const Armarios = require("../models/model-armario");
const Habitacion = require("../models/model-habit");
const express = require("express");
const router = express.Router();
const autorizacion = require("../middleware/checkAuth");

router.use(autorizacion);

//*OBTENER HABITACIONES
router.get("/", async (req, res, next) => {
  const usuarioId = req.datosUsuario.userId;
  console.log(usuarioId);
  try {
    const habitaciones = await Habitacion.find({ usuario: usuarioId }).populate(
      "casa"
    );
    res.send(habitaciones);
  } catch (err) {
    return next(err);
  }
});

//* HABITACIONES
router.post("/nueva", async (req, res, next) => {
  const usuarioId = req.datosUsuario.userId;
  const { casa, nombre } = req.body;
  const casabuscar = await Casa.findOne({ nombre: casa, usuario: usuarioId });
  try {
    if (!casabuscar) {
      res.status(404).json({
        message: "La casa no existe o no tiene permisos para modificarla",
      });
      return;
    }
    const habitacion = new Habitacion({
      casa: casabuscar._id,
      nombre,
      usuario: usuarioId,
    });
    await habitacion.save();
    casabuscar.habitaciones.push(habitacion);
    await casabuscar.save();
    res.json({ habitacion, casa: casabuscar });
  } catch (err) {
    res.status(500).json({ message: "Error interno del servidor" });
    return next(err);
  }
});

//*EDITAR HABITACIÓN

router.patch("/editar/:nombre", async (req, res, next) => {
  const { nombre } = req.params;
  const { nuevoNombre } = req.body;
  const usuarioId = req.datosUsuario.userId;
  if (!nuevoNombre || nuevoNombre.trim() === "") {
    const error = new Error("El nuevo nombre no puede estar vacío");
    error.statusCode = 422;
    return next(error);
  }
  let existeHabitacion;
  try {
    existeHabitacion = await Habitacion.findOne(
      { nombre: nombre },
      { usuario: usuarioId }
    );
  } catch (err) {
    const error = new Error("No se pudo encontrar la habitación");
    error.statusCode = 500;
    return next(error);
  }
  if (!existeHabitacion) {
    const error = new Error("No existe la habitación");
    error.statusCode = 404;
    return next(error);
  }
  try {
    const habitacion = await Habitacion.findOneAndUpdate(
      { nombre: nombre },
      { $set: { nombre: nuevoNombre } },
      { new: true }
    );
    res.json(habitacion);
  } catch (err) {
    const error = new Error("No se pudo actualizar la habitación");
    error.statusCode = 500;
    return next(error);
  }
});

//*ELIMINAR HABITACIÓN
router.delete("/borrar/:nombre", async (req, res, next) => {
  const usuarioId = req.datosUsuario.userId;
  existeHabitacion = await Habitacion.findOne(
    { nombre: req.params.nombre },
    { usuario: usuarioId }
  );
  if (!existeHabitacion) {
    res.json({ message: "No existe la habitación" });
    return next();
  }

  try {
    await Habitacion.findOneAndDelete({ nombre: req.params.nombre });
    res.json({ message: "Habitación eliminada" });
  } catch (err) {
    res.json({ message: err });
    return next(err);
  }
});

module.exports = router;
