import express from 'express';
import { createListing, getListings, deleteListing, updateListing, showlisting } from '../controllers/listing.controller.js';
import { verifyToken } from '../utils/verifyUser.js';
import { validateCSRFToken } from '../utils/csrf.js';

const router = express.Router();

// Define your listing routes here

router.post('/create', verifyToken, validateCSRFToken, createListing);
router.delete('/delete/:id', verifyToken, validateCSRFToken, deleteListing);
router.post('/update/:id', verifyToken, validateCSRFToken, updateListing);
router.get('/get/:id', showlisting);
router.get('/get', getListings);
export default router;
