const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const Caja = require("../models/model-cajas");
const Cosa = require("../models/model-cosas");
const Usuario = require("../models/model-usuario");

router.get("/", async (req, res) => {
  try {
    const cajas = await Caja.find().populate("cosas");
    res.send(cajas);
  } catch (err) {
    res.json({ message: err });
  }
});

router.delete("/eliminar/todas", async (req, res, next) => {
  try {
    const cajas = await Caja.deleteMany();
    res.json(cajas);
  } catch (err) {
    res.json({ message: err });
    return next(err);
  }
});

module.exports = router;
