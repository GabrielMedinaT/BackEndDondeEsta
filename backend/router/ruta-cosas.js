const mongoose = require("mongoose");
const Casa = require("../models/model-casa");
const Habitacion = require("../models/model-habit");
const Armario = require("../models/model-armario");
const Cajon = require("../models/model-cajon");
const cors = require("cors");
const Cosa = require("../models/model-cosas");
const express = require("express");
const router = express.Router();

//*VER COSAS

router.get("/", async (req, res) => {
  try {
    const cosas = await Cosa.find().populate("cajon");
    res.send(cosas);
  } catch (err) {
    res.json({ message: err });
  }
});

//*CREAR COSAS

router.post("/nuevo", async (req, res, next) => {
  const {
    nombre,
    descripcion,
    clasificacion,
    cajon,
    armario,
    habitacion,
    casa,
  } = req.body;
  let existeCajon, existeArmario, existeHabitacion, existeCasa;
  if (cajon) {
    existeCajon = await Cajon.findOne({ nombre: cajon });
    if (!existeCajon) {
      res.json({ message: "El cajón no existe" });
      return;
    }
    existeArmario = await Armario.findById(existeCajon.armario);
    existeHabitacion = await Habitacion.findById(existeArmario.habitacion);
    existeCasa = await Casa.findById(existeHabitacion.casa);
  } else if (armario) {
    existeArmario = await Armario.findOne({ nombre: armario });
    if (!existeArmario) {
      res.json({ message: "El armario no existe" });
      return;
    }
    existeHabitacion = await Habitacion.findById(existeArmario.habitacion);
    existeCasa = await Casa.findById(existeHabitacion.casa);
  } else if (habitacion) {
    existeHabitacion = await Habitacion.findOne({ nombre: habitacion });
    if (!existeHabitacion) {
      res.json({ message: "La habitación no existe" });
      return;
    }
    existeCasa = await Casa.findById(existeHabitacion.casa);
  } else if (casa) {
    existeCasa = await Casa.findOne({ nombre: casa });
    if (!existeCasa) {
      res.json({ message: "La casa no existe" });
      return;
    }
  }
  const cosa = new Cosa({
    nombre,
    descripcion,
    clasificacion,
    cajon: existeCajon ? existeCajon._id : null,
    armario: existeArmario ? existeArmario._id : null,
    habitacion: existeHabitacion ? existeHabitacion._id : null,
    casa: existeCasa ? existeCasa._id : null,
  });
  try {
    const cosaGuardada = await cosa.save();
    res.json(cosaGuardada);
  } catch (err) {
    res.json({ message: err });
  }
});

//*MODIFICAR COSA

router.patch("/editar/:nombre", async (req, res, next) => {
  const { nombre } = req.params;
  const { cajon, armario, habitacion, casa } = req.body;
  let existeCosa = await Cosa.findOne({ nombre: nombre });
  if (!existeCosa) {
    res.json({ message: "La cosa no existe" });
    return;
  }
  let existeCajon, existeArmario, existeHabitacion, existeCasa;
  if (cajon) {
    existeCajon = await Cajon.findOne({ nombre: cajon });
    if (!existeCajon) {
      res.json({ message: "El cajón no existe" });
      return;
    }
    existeArmario = await Armario.findById(existeCajon.armario);
    existeHabitacion = await Habitacion.findById(existeArmario.habitacion);
    existeCasa = await Casa.findById(existeHabitacion.casa);
  } else if (armario) {
    existeArmario = await Armario.findOne({ nombre: armario });
    if (!existeArmario) {
      res.json({ message: "El armario no existe" });
      return;
    }
    existeHabitacion = await Habitacion.findById(existeArmario.habitacion);
    existeCasa = await Casa.findById(existeHabitacion.casa);
  } else if (habitacion) {
    existeHabitacion = await Habitacion.findOne({ nombre: habitacion });
    if (!existeHabitacion) {
      res.json({ message: "La habitación no existe" });
      return;
    }
    existeCasa = await Casa.findById(existeHabitacion.casa);
  } else if (casa) {
    existeCasa = await Casa.findOne({ nombre: casa });
    if (!existeCasa) {
      res.json({ message: "La casa no existe" });
      return;
    }
  }
  await Cajon.findByIdAndUpdate(existeCosa.cajon, {
    $pull: { cosas: existeCosa._id, new: true },
  });
  await Armario.findByIdAndUpdate(existeCosa.armario, {
    $pull: { cosas: existeCosa._id },
  });
  await Habitacion.findByIdAndUpdate(existeCosa.habitacion, {
    $pull: { cosas: existeCosa._id },
  });
  await Casa.findByIdAndUpdate(existeCosa.casa, {
    $pull: { cosas: existeCosa._id },
  });
  if (existeCajon) {
    await Cajon.findByIdAndUpdate(existeCajon._id, {
      $push: { cosas: existeCosa._id },
    });
  } else {
    await Cosa.findByIdAndUpdate(existeCosa._id, {
      cajon: null,
    });
    await Cajon.findOneAndUpdate(existeCosa.cajon, {
      $pull: { cosas: existeCosa._id },
    });
  }
  if (existeArmario) {
    await Armario.findByIdAndUpdate(existeArmario._id, {
      $push: { cosas: existeCosa._id },
    });
  } else {
    await Cosa.findByIdAndUpdate(existeCosa._id, {
      armario: null,
    });
    await Armario.findOneAndUpdate(existeCosa.armario, {
      $pull: { cosas: existeCosa._id },
    });
  }
  if (existeHabitacion) {
    await Habitacion.findByIdAndUpdate(existeHabitacion._id, {
      $push: { cosas: existeCosa._id },
    });
  } else {
    await Cosa.findByIdAndUpdate(existeCosa._id, {
      habitacion: null,
    });
    await Habitacion.findOneAndUpdate(existeCosa.habitacion, {
      $pull: { cosas: existeCosa._id },
    });
  }
  await Casa.findByIdAndUpdate(existeCasa._id, {
    $push: { cosas: existeCosa._id },
  });
  try {
    await Cosa.findByIdAndUpdate(existeCosa._id, {
      cajon: existeCajon ? existeCajon._id : undefined,
      armario: existeArmario ? existeArmario._id : undefined,
      habitacion: existeHabitacion ? existeHabitacion._id : undefined,
      casa: existeCasa ? existeCasa._id : undefined,
    });
    res.json({ message: "Cosa modificada" });
  } catch (err) {
    res.json({ message: "error 2" });
  }
});

//*BORRAR COSA

router.delete("/borrar/:nombre", async (req, res, next) => {
  const { nombre } = req.params;
  let existeCosa = await Cosa.findOne({ nombre: nombre });
  let existeCajon = await Cajon.findById(existeCosa.cajon);
  let existeArmario = await Armario.findById(existeCosa.armario);
  let existeHabitacion = await Habitacion.findById(existeCosa.habitacion);
  let existeCasa = await Casa.findById(existeCosa.casa);
  if (!existeCosa) {
    res.json({ message: "La cosa no existe" });
    return next();
  }
  if (existeCajon) {
    await Cajon.findByIdAndUpdate(existeCajon._id, {
      $pull: { cosas: existeCosa._id, new: true },
    });
  }
  if (existeArmario) {
    await Armario.findByIdAndUpdate(existeArmario._id, {
      $pull: { cosas: existeCosa._id },
    });
  }
  if (existeHabitacion) {
    await Habitacion.findByIdAndUpdate(existeHabitacion._id, {
      $pull: { cosas: existeCosa._id },
    });
  }
  if (existeCasa) {
    await Casa.findByIdAndUpdate(existeCasa._id, {
      $pull: { cosas: existeCosa._id },
    });
  }

  try {
    await Cosa.findByIdAndDelete(existeCosa._id);
    res.json({ message: "Cosa borrada" });
  } catch (err) {
    res.json({ message: err });
  }
});

module.exports = router;
