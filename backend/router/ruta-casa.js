const mongoose = require("mongoose");
const Casa = require("../models/model-casa");
const Habitacion = require("../models/model-habit"); // Nombre corregido
const Armario = require("../models/model-armario"); // Nombre corregido
const Cajon = require("../models/model-cajon");
const Usuario = require("../models/model-usuario");
const Caja = require("../models/model-cajas");
const express = require("express");
const router = express.Router();
const checkAuth = require("../middleware/checkAuth");
const cors = require("cors");
const autorizacion = require("../middleware/checkAuth");

// router.use(cors());

router.use(checkAuth);
//*VER CASAS

router.get("/", autorizacion, async (req, res, next) => {
  const usuarioId = req.datosUsuario.userId;

  try {
    const casas = await Casa.find({ usuario: usuarioId }).populate(
      "habitaciones"
    );
    res.send(casas);
  } catch (err) {
    res.json({ message: "No se pueden obtener las casas" });
    return next(err);
  }
});

router.get("/:nombre", async (req, res) => {
  const { nombre } = req.params;
  try {
    const casa = await Casa.findOne({ nombre }).populate("cosas");
    res.send(casa);
  } catch (err) {
    res.json({ message: "No se puede obtener la casa" });
    return next(err);
  }
});

//*CREAR CASA
router.post("/nueva", async (req, res, next) => {
  const usuarioId = req.datosUsuario.userId;
  const { nombre, direccion, ciudad, habitaciones, cosas, usuario } = req.body;
  // let existeUsuario = await Usuario.findOne({ email: usuario });
  // if (!existeUsuario) {
  //   res.json({ message: "No existe el usuario" });
  //   return next();
  // }
  const casa = new Casa({
    nombre,
    direccion,
    ciudad,
    habitaciones,
    cosas,
    usuario: usuarioId,
  });

  try {
    const casaUsuario = await Usuario.findOneAndUpdate(
      { email: usuario },
      { $push: { casas: casa._id } },
      { new: true }
    );

    const casaGuardada = await casa.save();
    res.json(casaGuardada);
  } catch (err) {
    res.json({ message: "No se pudo guardar la casa" });
    return next(err);
  }
});

// Ruta para modificar el nombre de una casa
router.patch("/editar/:nombre", async (req, res, next) => {
  const userId = req.datosUsuario.userId;
  const { nombre } = req.params;
  const { nuevoNombre } = req.body;
  try {
    // Buscar la casa por su nombre y el ID del usuario que la creó
    const casa = await Casa.findOne({ nombre, usuario: userId });
    if (!casa) {
      res.status(404).json({
        message: "La casa no existe o no pertenece al usuario actual",
      });
      return next();
    }
    // Actualizar el nombre de la casa
    casa.nombre = nuevoNombre;
    const casaActualizada = await casa.save();
    res.json(casaActualizada);
  } catch (err) {
    res.json({ message: "No se pudo modificar la casa" });
    return next(err);
  }
});

// Ruta para borrar una casa
router.delete("/borrar/:id", autorizacion, async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const casaBuscar = await Casa.findById(req.params.id).session(session);

      if (!casaBuscar) {
        res.json({ message: "No existe la casa" });
        return next();
      }

      // Validar que el usuario autenticado sea el mismo que creó la casa
      if (casaBuscar.usuario.toString() !== req.datosUsuario.userId) {
        res.status(404).json({ message: "La casa no existe" });
        return next();
      }

      // Obtener las cosas de la casa que se va a eliminar
      const cosas = casaBuscar.cosas;

      // Borrar todas las habitaciones de la casa y los armarios y cajones asociados
      await Habitacion.deleteMany({ casa: casaBuscar._id }).session(session);
      const armariosBuscar = await Armario.find({
        habitacion: { $in: casaBuscar.habitaciones },
      }).session(session);
      const armariosIds = armariosBuscar.map((armario) => armario._id);
      await Cajon.deleteMany({ armario: { $in: armariosIds } }).session(
        session
      );
      await Armario.deleteMany({
        habitacion: { $in: casaBuscar.habitaciones },
      }).session(session);

      // Crear una nueva instancia de Caja y asignarle las cosas de la casa
      const nuevaCaja = new Caja({
        nombre: `${casaBuscar.nombre}_caja`,
        cosas: cosas,
      });

      // Guardar la nueva caja en la base de datos
      const cajaGuardada = await nuevaCaja.save();

      await Casa.findByIdAndDelete(req.params.id).session(session);

      let usuario = await Usuario.findById({ casas: casaBuscar._id }).session(
        session
      );

      if (!usuario) {
        res.json({ message: "El usuario no existe" });
        return next();
      }

      usuario.casas.pull(casaBuscar._id);

      res.json({ message: "Casa borrada y cosas asignadas a la nueva caja" });
    });
  } catch (err) {
    res.json({ message: "No se pudo borrar la casa" });
    return next(err);
  } finally {
    session.endSession();
  }
});

module.exports = router;
