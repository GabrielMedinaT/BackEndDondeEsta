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
  const { nombre, casa, habitacion } = req.body;
  let existeArmario;
  try {
    existeArmario = await Armario.findOne({ nombre: req.params.nombre });
  } catch (err) {
    res.json({ message: "no se puede 1" });
    return next(err);
  }
  if (!existeArmario) {
    res.json({ message: "No existe el armario" });
    return next();
  }
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
  let antiguaHabitacion = await Habitacion.findOne({
    armarios: existeArmario._id,
  });

  await Habitacion.findOneAndUpdate(
    { _id: antiguaHabitacion._id },
    { $pull: { armarios: existeArmario._id } },
    { new: true }
  );
  antiguaHabitacion.armarios.pull(existeArmario._id);
  await antiguaHabitacion.save();

  await Habitacion.findOneAndUpdate(
    { _id: existeHabitacion._id },
    { $push: { armarios: existeArmario._id } },
    { new: true }
  );
  existeHabitacion.armarios.push(existeArmario._id);
  await existeHabitacion.save();

  try {
    await Armario.findOneAndUpdate(
      { _id: existeArmario._id },
      {
        nombre,
        casa: existeCasa ? existeCasa._id : null,
        habitacion: existeHabitacion._id,
      },
      { new: true }
    );
    res.json({ message: "Armario modificado" });
  } catch (err) {
    res.json({ message: "no se puede 2" });
    return next(err);
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
