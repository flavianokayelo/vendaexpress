const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const pool = require('../db');

function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

async function signup(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email e password são obrigatórios' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'A palavra-passe deve ter pelo menos 6 caracteres' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Email já registado' });
    }

    const hash = await bcrypt.hash(password, 10);
    const id = uuidv4();

    await pool.query(
      'INSERT INTO users (id, email, password) VALUES (?, ?, ?)',
      [id, email, hash]
    );

    const user = { id, email };
    const token = signToken(user);
    return res.status(201).json({ user, token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email e password são obrigatórios' });
    }

    const [rows] = await pool.query('SELECT id, email, password FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const dbUser = rows[0];
    const match = await bcrypt.compare(password, dbUser.password);
    if (!match) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const user = { id: dbUser.id, email: dbUser.email };
    const token = signToken(user);
    return res.json({ user, token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
}

async function me(req, res) {
  return res.json({ user: { id: req.userId, email: req.userEmail } });
}

module.exports = { signup, login, me };