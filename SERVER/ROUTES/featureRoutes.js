import express from 'express';
import { getAllUsers, getMessagesBetweenUsers,getSearchedUser } from '../CONTROLLER/featureController.js';


const router = express.Router();


router.get('/users', getAllUsers);
router.get('/messages', getMessagesBetweenUsers);
router.get('/find-users',getSearchedUser)

export default router;