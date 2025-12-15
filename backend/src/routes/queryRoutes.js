import express from "express";
// import queryController here
import queryController from "../../src/controller/queryController.js";
import getSchema from "../../src/controller/getSchema.js";

const router = express.Router();

// initialize a post request
router.post("/", queryController);
router.get("/", getSchema);

export default router;
