import { runQuery } from "../../src/services/executeQuery.js";

const queryController = async (req, res) => {
  console.log("Request body", req.body);
  const { query } = req.body;

  try {
    const response = await runQuery(query);
    res.status(201).json({ queryResult: response });
  } catch (error) {
    console.log("Some error occured while executing query:", error);

    res
      .status(500)
      .json({ queryResult: null, message: "Failed to get query results" });
  }
};

export default queryController;
