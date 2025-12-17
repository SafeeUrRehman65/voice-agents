const GOOGLE_API_KEY = "AIzaSyCchHTjgOYE6ExFnY58JXurUJkc0WbTPbw";
const GOOGLE_CX_ID = "03f63eee146df4e0f";

const googleSearch = async (query) => {
  console.log("Performing Google Search for:", query);

  try {
    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CX_ID}&q=${encodeURIComponent(
        query
      )}`
    );

    if (!response.ok) {
      throw new Error(`Google API Error: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return {
        queryResult: "No results found for this query via Google Search.",
      };
    }

    // Format top 5 results
    const formattedResults = data.items
      .slice(0, 5)
      .map((item) => {
        return `Title: ${item.title}\nSnippet: ${item.snippet}\nLink: ${item.link}\n---`;
      })
      .join("\n");

    return {
      queryResult: formattedResults,
    };
  } catch (error) {
    console.error("Search failed:", error);
    return {
      queryResult: "An error occurred while searching Google.",
    };
  }
};

export default googleSearch;
