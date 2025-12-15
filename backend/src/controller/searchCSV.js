import searchCSVService from "../services/searchCSVService.js";
const searchCSV = async (req, res) => {
  console.log("Request received", req.query);
  const { query } = req.query;

  try {
    const response = await searchCSVService(query);
    res.status(201).json({ queryResult: response });
  } catch (error) {
    console.log("Some error occured while answering query:", error);

    res
      .status(500)
      .json({ queryResult: null, message: "Failed to get query results" });
  }
};

export default searchCSV;
