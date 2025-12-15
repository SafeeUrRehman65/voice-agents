import express from "express";
// import queryController here
import searchCSV from "../controller/searchCSV.js";
const router = express.Router();

// initialize a get request
router.get("/", searchCSV);

export default router;
