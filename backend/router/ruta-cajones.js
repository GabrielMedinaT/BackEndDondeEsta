const express = require("express");
const Armarios = require("../models/model-armario");
const Cajon = require("../models/model-cajon");
const Cosas = require("../models/model-cosas");
const Habitacion = require("../models/model-habit");
const Casa = require("../models/model-casa");
const checkAuth = require("../middleware/checkAuth");
const autorizacion = require("../middleware/checkAuth");
const router = express.Router();
const Caja = require("../models/model-cajas");
const cors = require("cors");

router.use(cors());

router.use(checkAuth);

router.get("/", autorizacion, async (req, res) => {
  const usuarioId = req.datosUsuario.userId;
  try {
    const cajones = await Cajon.find({ usuario: usuarioId }).populate("cosas");
    res.send(cajones);
  } catch (err) {
    res.json({ message: err });
  }
});

router.post("/nuevo", autorizacion, async (req, res, next) => {
  const usuarioId = req.datosUsuario.userId;
  const { nombre, armario, habitacion, cosas } = req.body;
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
  let existeHabitacion;
  try {
    existeHabitacion = await Habitacion.findOne({ nombre: habitacion });
  } catch (err) {
    res.json({ message: err });
    return next(err);
  }
  if (!existeHabitacion) {
    return res.json("No existe la habitacion  ");
  }
  const cajon = new Cajon({
    nombre,
    habitacion: existeHabitacion._id,
    nombreHabitacion: existeHabitacion.nombre,
    armario: existeArmario._id,
    nombreArmario: existeArmario.nombre,
    usuario: usuarioId,
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
router.patch("/editar/:nombre", checkAuth, async (req, res, next) => {
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
router.delete("/eliminar/:nombre", checkAuth, async (req, res, next) => {
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
    const armarioId = existeCajon.armario;

    // Eliminar el cajón del array cajon de la colección Armarios
    await Armarios.updateOne(
      { _id: armarioId },
      { $pull: { cajon: existeCajon._id } }
    );

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
