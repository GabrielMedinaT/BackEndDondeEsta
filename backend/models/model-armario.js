const mongoose = require("mongoose");
const Habitacion = require("../models/model-habit");

const armarioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    minLenght: 3,
    maxLenght: 20,
  },
  habitacion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Habitacion",
    required: true,
  },
  nombreHabitacion: {
    type: String,
    required: true,
    minLenght: 3,
    maxLenght: 20,
  },
  casa: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Casa",
    required: true,
  },

  cajon: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cajon",
    },
  ],
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

module.exports = mongoose.model("Armarios", armarioSchema);
