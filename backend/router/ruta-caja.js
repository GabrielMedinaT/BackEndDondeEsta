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

module.exports = router;
