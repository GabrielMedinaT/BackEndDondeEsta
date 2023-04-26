const mongoose = require("mongoose");

const casaSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    minLenght: 3,
    maxLenght: 20,
  },
  direccion: {
    type: String,
    required: true,
    minLenght: 3,
    maxLenght: 20,
  },
  ciudad: {
    type: String,
    required: true,
    minLenght: 3,
    maxLenght: 20,
  },
  habitaciones: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Habitacion",
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
    required: true,
  },
});

module.exports = mongoose.model("Casa", casaSchema);
