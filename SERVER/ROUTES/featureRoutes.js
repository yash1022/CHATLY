import express from 'express';
import { getAllUsers, getMessagesBetweenUsers,getSearchedUser,addToContacts } from '../controller/featureController.js';


const router = express.Router();


router.get('/users', getAllUsers);
router.get('/messages', getMessagesBetweenUsers);
router.get('/find-users',getSearchedUser)
router.post('/contacts/add',addToContacts);


export default router;