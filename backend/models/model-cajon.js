const mongoose = require("mongoose");
const Armarios = require("../models/model-armario");

const cajonSchema = new mongoose.Schema({
  nombre: {
    type: String,
    require: true,
    minLenght: 3,
    maxLenght: 20,
  },
  armario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Armario",
  },
  cosas: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cosa",
    },
  ],
});

module.exports = mongoose.model("Cajon", cajonSchema);
