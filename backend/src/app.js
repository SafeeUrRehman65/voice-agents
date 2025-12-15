import express from "express";
import cors from "cors";
import morgan from "morgan";
import queryRoutes from "../src/routes/queryRoutes.js";
import searchRoutes from "../src/routes/searchRoutes.js";
const app = express();

app.use(cors());

app.use(morgan("dev"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// use query routes to route the api call correctly
app.use("/user-query", queryRoutes);
app.use("/search-csv", searchRoutes);

export default app;
