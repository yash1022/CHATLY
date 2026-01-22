import express from 'express';
import { storeConversationKey, getConversationKey } from '../CONTROLLER/keysController.js';

const router = express.Router();



router.post('/', storeConversationKey );
router.get('/:id', getConversationKey );

export default router;




