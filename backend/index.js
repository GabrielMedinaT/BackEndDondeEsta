const express = require("express");
const app = express();
const mongoose = require("mongoose");
const port = 5000;
app.use(express.json());
require("dotenv").config();
const usuario = require("./router/ruta-usuarios");
const casa = require("./router/ruta-casa");
const habitacion = require("./router/ruta-habitacion");
const armario = require("./router/ruta-armario");
const cajones = require("./router/ruta-cajones");
const cosas = require("./router/ruta-cosas");
const caja = require("./router/ruta-caja");
const cors = require("cors");
app.use(cors());
app.use("/api/usuarios", usuario);
app.use("/api/casas/", casa);
app.use("/api/habitaciones/", habitacion);
app.use("/api/armarios/", armario);
app.use("/api/cajones/", cajones);
app.use("/api/cosas/", cosas);
app.use("/api/cajas/", caja);

mongoose
  .connect(process.env.MONGO_DB_URI)
  .then(() =>
    app.listen(5000, () =>
      console.log(
        "Conectado a la base de datos y escuchando por el puerto 10000"
      )
    )
  )
  .catch((err) => console.log(err));
