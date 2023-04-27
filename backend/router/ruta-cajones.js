const express = require("express");
const Armarios = require("../models/model-armario");
const Cajon = require("../models/model-cajon");
const Cosas = require("../models/model-cosas");
const Habitacion = require("../models/model-habit");
const Casa = require("../models/model-casa");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const cajones = await Cajon.find().populate("cosas");
    res.send(cajones);
  } catch (err) {
    res.json({ message: err });
  }
});

router.post("/nuevo", async (req, res, next) => {
  const { nombre, armario, cosas } = req.body;
  let existeArmario;
  try {
    existeArmario = await Armarios.findOne({ nombre: armario });
  } catch (err) {
    res.json({ message: err });
    return next(err);
  }
  if (!existeArmario) {
    return res.json("No existe el armario  ");
  }
  const cajon = new Cajon({
    nombre,
    armario: existeArmario._id,
  });
  try {
    await Armarios.findOneAndUpdate(
      { _id: existeArmario },
      { $push: { cajon: cajon._id } },
      { new: true }
    );
    const cajonGuardado = await cajon.save();
    res.json(cajonGuardado);
    next();
  } catch (err) {
    res.json({ message: err });
    return next(err);
  }
});

//*MODIFICAR CAJON
router.patch("/editar/:nombre", async (req, res, next) => {
  const { nuevoNombre } = req.body;
  const { nombre } = req.params;
  let existeCajon;
  try {
    existeCajon = await Cajon.findOne({ nombre: nombre });
  } catch (err) {
    res.json({ message: err });
    return next(err);
  }
  if (!existeCajon) {
    return res.json("No existe el cajon  ");
  }
  try {
    await Cajon.findOneAndUpdate(
      { _id: existeCajon._id },
      { $set: { nombre: nuevoNombre } },
      { new: true }
    );
    res.json("Cajon modificado");
    next();
  } catch (err) {
    res.json({ message: err });
    return next(err);
  }
});

//*ELIMINAR CAJON
router.delete("/eliminar/:nombre", async (req, res, next) => {
  const { nombre } = req.params;
  let existeCajon;
  try {
    existeCajon = await Cajon.findOne({ nombre: nombre });
  } catch (err) {
    res.json({ message: err });
    return next(err);
  }
  if (!existeCajon) {
    return res.json("No existe el cajon  ");
  }
  try {
    const nuevaCaja = new Caja({
      nombre: `${existeCajon.armario.nombre}-${existeCajon.nombre}`,
      cosas: Cosas,
    });

    await Cajon.findOneAndDelete({ _id: existeCajon._id });
    res.json("Cajon eliminado");
    next();
  } catch (err) {
    res.json({ message: err });
    return next(err);
  }
});

let existeArmario;

module.exports = router;
