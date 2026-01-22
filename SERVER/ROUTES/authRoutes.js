import express from 'express';
import {register, login , refresh, logout} from '../CONTROLLER/UserController.js';

import authMiddleware from '../MIDDLEWARE/authMiddleware.js';

const router = express.Router();


router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);


export default router;

