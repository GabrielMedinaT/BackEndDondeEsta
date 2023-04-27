const mongoose = require("mongoose");
const express = require("express");
const Habitacion = require("../models/model-habit");
const Armario = require("../models/model-armario");
const Cajon = require("../models/model-cajon");
const Casa = require("../models/model-casa");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const armarios = await Armario.find().populate("habitacion");
    res.send(armarios);
  } catch (err) {
    res.json({ message: err });
  }
});

router.post("/nuevo", async (req, res, next) => {
  const { nombre, casa, habitacion, cajon } = req.body;
  let existeHabitacion;
  try {
    existeHabitacion = await Habitacion.findOne({ nombre: habitacion });
  } catch (err) {
    res.json({ message: "no se puede 1" });
    return next(err);
  }
  if (!existeHabitacion) {
    res.json({ message: "No existe la habitacion" });
    return next();
  }
  let existeCasa = await Casa.findOne({ nombre: casa });
  if (!existeCasa) {
    res.json({ message: "No existe la casa" });
    return next();
  }
  const armario = new Armario({
    nombre,
    casa: existeCasa._id,
    habitacion: existeHabitacion._id,
    cajon,
  });
  try {
    await Habitacion.findOneAndUpdate(
      { _id: existeHabitacion._id },
      { $push: { armario: armario._id } },
      { new: true }
    );
    existeHabitacion.armarios.push(armario._id);
    await existeHabitacion.save();
    const armarioGuardado = await armario.save();
    res.json(armarioGuardado);
  } catch (err) {
    res.json({ message: "no se puede 2" });
    return next(err);
  }
});

//*MODIFICAR ARMARIO
router.patch("/editar/:nombre", async (req, res, next) => {
  const { nombre } = req.params;
  const { nuevoNombre, habitacion } = req.body;

  let armario;
  try {
    armario = await Armario.findOne({ nombre });
    if (!armario) {
      const error = new Error("No existe el armario");
      error.statusCode = 404;
      return next(error);
    }
  } catch (err) {
    res.json({ message: err });
    return next(err);
  }

  // Busca la habitación antigua
  let habitacionAntigua;
  try {
    habitacionAntigua = await Habitacion.findById(armario.habitacion);
    if (!habitacionAntigua) {
      res.json({ message: "No existe la habitacion antigua" });
      return next();
    }
  } catch (err) {
    res.json({ message: "No se puede buscar la habitacion antigua" });
    return next(err);
  }

  // Actualiza la habitación antigua y elimina el armario del array de armarios
  try {
    await Habitacion.findByIdAndUpdate(habitacionAntigua._id, {
      $pull: { armarios: { nombre: armario._id } },
    });
  } catch (err) {
    res.json({ message: "No se puede actualizar la habitacion antigua" });
    return next(err);
  }

  // Busca la nueva habitación
  let habitacionNueva;
  try {
    habitacionNueva = await Habitacion.findOne({ habitacionNueva: habitacion });
    console.log(habitacionNueva);
    if (!habitacionNueva) {
      res.json({ message: "No existe la habitacion nueva" });
      return next();
    }
  } catch (err) {
    res.json({ message: "No se puede buscar la habitacion nueva" });
    return next(err);
  }

  // Actualiza la nueva habitación y agrega el armario al array de armarios
  try {
    await Habitacion.findByIdAndUpdate(habitacionNueva._id, {
      $push: { armarios: { nombre: armario._id } },
    });
  } catch (err) {
    res.json({ message: "No se puede actualizar la habitacion nueva" });
    return next(err);
  }

  // Actualiza el nombre del armario si se proporcionó uno nuevo
  if (nuevoNombre && nuevoNombre.trim() !== "") {
    armario.nombre = nuevoNombre;
    try {
      const armarioGuardado = await armario.save();
      res.json(armarioGuardado);
    } catch (err) {
      res.json({ message: "No se puede guardar el armario" });
      return next(err);
    }
  } else {
    res.json({ message: "Armario actualizado sin cambios" });
  }
});

//*BORRAR ARMARIO
router.delete("/borrar/:nombre", async (req, res, next) => {
  exiteArmario = await Armario.findOne({ nombre: req.params.nombre });
  if (!exiteArmario) {
    res.json({ message: "No existe el armario" });
    return next();
  }
  try {
    await Armario.findOneAndDelete({ nombre: req.params.nombre });
    res.json({ message: "Armario borrado" });
  } catch (err) {
    res.json({ message: "No se puede borrar el armario" });
    return next(err);
  }
});

module.exports = router;
