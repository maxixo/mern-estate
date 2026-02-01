import express from 'express';
import { signup } from '../controllers/auth.controller.js';
import { signin } from '../controllers/auth.controller.js';
import { google } from '../controllers/auth.controller.js';
import { signOut } from '../controllers/auth.controller.js';
import { csrfProtection, validateCSRFToken } from '../utils/csrf.js';



const router = express.Router();

// Get CSRF token (safe endpoint)
router.get("/csrf", csrfProtection, (req, res) => {
  res.json({ csrfToken: res.locals.csrfToken });
});

// Auth routes - exempt signup and signin from CSRF to allow initial authentication
router.post("/signup", signup);
router.post("/signin", signin);
router.post("/google", google);
router.get("/signout", signOut);

export default router;
