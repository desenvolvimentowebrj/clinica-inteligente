// backend/middlewares/roleMiddleware.js
module.exports = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!rolesPermitidos.includes(req.usuario.tipo)) {
      return res.status(403).json({ erro: 'Acesso negado' });
    }
    next();
  };
};
