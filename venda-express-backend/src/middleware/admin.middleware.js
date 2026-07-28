async function requireAdmin(req, res, next) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    return res.status(500).json({ error: 'Admin não configurado. Define ADMIN_EMAIL no .env' });
  }
  if (req.userEmail !== adminEmail) {
    return res.status(403).json({ error: 'Apenas administradores' });
  }
  next();
}

module.exports = { requireAdmin };
