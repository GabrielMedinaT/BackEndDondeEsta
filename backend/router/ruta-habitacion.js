const mongoose = require("mongoose");
const Cajon = require("../models/model-cajon");
const Casa = require("../models/model-casa");
const Armarios = require("../models/model-armario");
const Habitacion = require("../models/model-habit");
const Caja = require("../models/model-cajas");
const express = require("express");
const router = express.Router();
const autorizacion = require("../middleware/checkAuth");

router.use(autorizacion);

//*OBTENER HABITACIONES
router.get("/", autorizacion, async (req, res, next) => {
  const usuarioId = req.datosUsuario.userId;
  console.log(usuarioId);
  try {
    const habitaciones = await Habitacion.find({ usuario: usuarioId }).populate(
      "armarios"
    );
    res.send(habitaciones);
  } catch (err) {
    return next(err);
  }
});

//* HABITACIONES
router.post("/nueva", autorizacion, async (req, res, next) => {
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

router.patch("/editar/:nombre", autorizacion, async (req, res, next) => {
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

router.delete("/borrar/:nombre", autorizacion, async (req, res, next) => {
  const nombreHabitacion = req.params.nombre;
  const usuarioId = req.datosUsuario.userId;

  try {
    // Buscar la habitación a eliminar
    const habitacion = await Habitacion.findOne({
      nombre: nombreHabitacion,
      usuario: usuarioId,
    });
    if (!habitacion) {
      res.json({ message: "No se encontró la habitación" });
      return next();
    }

    // Buscar la casa que contiene la habitación
    const casa = await Casa.findOne({
      habitaciones: { $in: [habitacion._id] },
    });
    if (!casa) {
      res.json({
        message: "No se encontró la casa que contiene la habitación",
      });
      return next();
    }

    // Eliminar el ID de la habitación del array de habitaciones de la casa
    casa.habitaciones = casa.habitaciones.filter(
      (hab) => hab.toString() !== habitacion._id.toString()
    );
    await casa.save();

    // Eliminar la habitación de la colección
    await Habitacion.findOneAndDelete({ nombre: nombreHabitacion });

    // Eliminar los armarios asociados a la habitación
    await Armarios.deleteMany({ habitacion: habitacion._id });

    // Obtener los IDs de los armarios eliminados
    const armariosEliminados = habitacion.armarios.map(
      (armario) => armario._id
    );

    // Eliminar los cajones asociados a los armarios eliminados y guardar las cosas en una caja
    const caja = new Caja({
      nombre: "Caja de cosas de la habitación eliminada",
      cosas: [],
    });

    // Buscar y eliminar los cajones asociados a los armarios eliminados
    const cajonesEliminados = await Cajon.find({
      armario: { $in: armariosEliminados },
    });
    const cosas = cajonesEliminados.map((cajon) => cajon.cosas);
    caja.cosas = cosas;
    await Cajon.deleteMany({ armario: { $in: armariosEliminados } });
    await caja.save();

    res.json({
      message:
        "Habitación eliminada, junto con los armarios y cajones asociados. Las cosas se guardaron en una caja.",
    });
  } catch (err) {
    res.json({ message: err });
    return next(err);
  }
});

module.exports = router;
