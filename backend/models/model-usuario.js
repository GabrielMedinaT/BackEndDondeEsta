const mongoose = require("mongoose");

const usuarioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    minLenght: 3,
    maxLenght: 20,
  },
  email: {
    type: String,
    required: true,
    minLenght: 3,
    maxLenght: 20,
  },
  password: {
    type: String,
    required: true,
    minLenght: 3,
    maxLenght: 20,
  },
  casas: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Casa",
    },
  ],
});

module.exports = mongoose.model("Usuario", usuarioSchema);
