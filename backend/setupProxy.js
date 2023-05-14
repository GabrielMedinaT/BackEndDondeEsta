const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://localhost:3000",
      changeOrigin: true,
    })
  );
  app.use(
    "/auth",
    createProxyMiddleware({
      target: "http://localhost:3000",
      changeOrigin: true,
    })
  );
  app.use(
    "/api",
    "/auth",
    "/login",
    "/register",
    "/logout",
    "/api/casa",
    "/api/habitaciones",
    "/api/armario",
    "/api/cajon",
    "/api/cosa",
    "/api/usuario/login",
    "/api/usuario/registro",
    "/api/usuarios/password",
    "/api/casas/nueva",
    "/api/habitaciones/nueva",
    createProxyMiddleware({
      target: "https://whereisthe.netlify.app/",
      changeOrigin: true,
    })
  );
};
