import express from "express";

import startChatController from "../controller/startChatController.js";

const router = express.Router();

router.post("/", startChatController);

export default router;
