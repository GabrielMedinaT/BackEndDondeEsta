const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cosaSchema = new Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String, required: true },
  clasificacion: { type: String, required: true },
  cajon: { type: Schema.Types.ObjectId, ref: "Cajon" },
  armario: { type: Schema.Types.ObjectId, ref: "Armario" },
  habitacion: { type: Schema.Types.ObjectId, ref: "Habitacion" },
  casa: { type: Schema.Types.ObjectId, ref: "Casa" },
  caja: { type: Schema.Types.ObjectId, ref: "Caja" },
  prestado: { type: Boolean, required: false },
});

module.exports = mongoose.model("Cosa", cosaSchema);
