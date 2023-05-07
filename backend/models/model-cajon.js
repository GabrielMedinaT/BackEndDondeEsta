const mongoose = require("mongoose");
const Armarios = require("../models/model-armario");

const cajonSchema = new mongoose.Schema({
  nombre: {
    type: String,
    require: true,
    minLenght: 3,
    maxLenght: 20,
  },
  habitacion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Habitacion",
  },
  nombreHabitacion: {
    type: String,
    require: true,
    minLenght: 3,
    maxLenght: 20,
  },
  armario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Armario",
  },
  nombreArmario: {
    type: String,
    require: true,
    minLenght: 3,
    maxLenght: 20,
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

module.exports = mongoose.model("Cajon", cajonSchema);
