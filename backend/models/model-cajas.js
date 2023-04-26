const mongoose = require("mongoose");

const cajasSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    minLenght: 3,
    maxLenght: 20,
  },
  cosas: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cosa",
    },
  ],
});

module.exports = mongoose.model("Caja", cajasSchema);
