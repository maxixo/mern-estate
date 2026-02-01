import express from 'express';
import { test } from '../controllers/user.controller.js';
import { updateUser, getUserListings , getUser } from '../controllers/user.controller.js';
import { verifyToken } from '../utils/verifyUser.js';
import { deleteUser } from '../controllers/user.controller.js';
import { validateCSRFToken } from '../utils/csrf.js';

const router = express.Router();

router.get('/test', test); 
router.post('/update/:id', verifyToken, validateCSRFToken, updateUser);
router.delete('/delete/:id', verifyToken, validateCSRFToken, deleteUser );
router.get('/listings/:id', verifyToken, getUserListings);
router.get('/:id', verifyToken, getUser);


export default router;