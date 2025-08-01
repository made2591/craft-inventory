import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

/**
 * Configura le rotte per l'autenticazione
 * @param {Object} pool - Pool di connessione al database PostgreSQL
 * @param {Function} toCamelCase - Funzione per convertire snake_case in camelCase
 * @returns {express.Router} Router configurato
 */
export default function authRoutes(pool, toCamelCase) {
  // POST /api/auth/register - Registra un nuovo utente
  router.post('/register', async (req, res) => {
    try {
      const { username, email, password } = req.body;
      const id = uuidv4();
      const now = new Date();

      // Check if username or email already exists
      const existingUser = await pool.query(
        'SELECT * FROM users WHERE username = $1 OR email = $2',
        [username, email]
      );

      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'Username or email already in use' });
      }

      // In a real app, you would hash the password here
      // For simplicity, we're storing it as plain text (NOT recommended for production)
      const result = await pool.query(
        'INSERT INTO users (id, username, email, password, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, username, email, created_at',
        [id, username, email, password, now, now]
      );

      // Generate a simple token (in a real app, use JWT)
      const token = Buffer.from(`${id}:${now.getTime()}`).toString('base64');

      res.status(201).json({
        token,
        user: toCamelCase(result.rows[0])
      });
    } catch (err) {
      console.error('Error registering user:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // POST /api/auth/login - Effettua il login di un utente
  router.post('/login', async (req, res) => {
    try {
      const { username, password } = req.body;

      // Find user by username
      const result = await pool.query(
        'SELECT * FROM users WHERE username = $1',
        [username]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const user = result.rows[0];

      // In a real app, you would compare hashed passwords
      // For simplicity, we're comparing plain text (NOT recommended for production)
      if (user.password !== password) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate a simple token (in a real app, use JWT)
      const token = Buffer.from(`${user.id}:${new Date().getTime()}`).toString('base64');

      // Remove password from user object
      delete user.password;

      res.json({
        token,
        user: toCamelCase(user)
      });
    } catch (err) {
      console.error('Error logging in:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}