const mongoose = require("mongoose");
const Cajon = require("../models/model-cajon");
const Casa = require("../models/model-casa");
const Armarios = require("../models/model-armario");
const Habitacion = require("../models/model-habit");
const express = require("express");
const router = express.Router();

//*OBTENER HABITACIONES
router.get("/", async (req, res, next) => {
  try {
    const habitaciones = await Habitacion.find().populate("armarios");
    res.send(habitaciones);
  } catch (err) {
    return next(err);
  }
});

//* HABITACIONES
router.post("/nueva", async (req, res, next) => {
  const { casa, nombre, armario } = req.body;
  let existeCasa;
  try {
    existeCasa = await Casa.findOne({ nombre: casa }).populate("habitaciones");
  } catch (err) {
    res.json({ message: err });
    return next(err);
  }
  if (!existeCasa) {
    res.json({ message: "No existe la casa" });
    return next();
  }
  const habitacion = new Habitacion({
    casa: existeCasa._id,
    nombre,
    armario,
  });
  try {
    await habitacion.save();
    existeCasa.habitaciones.push(habitacion);
    await existeCasa.save();
    res.json({ habitacion, casa: existeCasa });
  } catch (err) {
    res.json({ message: err });
    return next(err);
  }
});

//*EDITAR HABITACIÓN

router.patch("/editar/:nombre", async (req, res, next) => {
  const { nombre } = req.params;
  const { nuevoNombre } = req.body;
  if (!nuevoNombre || nuevoNombre.trim() === "") {
    const error = new Error("El nuevo nombre no puede estar vacío");
    error.statusCode = 422;
    return next(error);
  }
  let existeHabitacion;
  try {
    existeHabitacion = await Habitacion.findOne({ nombre: nombre });
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
  existeHabitacion = await Habitacion.findOne({ nombre: req.params.nombre });
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
