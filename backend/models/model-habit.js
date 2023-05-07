const mongoose = require("mongoose");
const Casa = require("../models/model-casa");
const Armarios = require("../models/model-armario");

const habitacionSchema = new mongoose.Schema({
  casa: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Casa",
  },
  nombre: {
    type: String,
    required: true,
    minLenght: 3,
    maxLenght: 20,
    required: true,
  },
  armarios: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Armarios",
    },
  ],
  nombreArmarios: {
    type: String,
  },
  cosas: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cosa",
    },
  ],
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario",
  },
});

module.exports = mongoose.model("Habitacion", habitacionSchema);
