const runQuery = async (query) => {
  try {
    const response = await fetch("http://localhost:3000/user-query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });
    if (!response.ok)
      throw new Error("Some error occured while executing query");
    const data = response.json();
    return data;
  } catch (error) {
    console.log("Some error occured while routing query to backend");
  }
};

export default runQuery;
