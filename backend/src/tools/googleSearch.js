import * as z from "zod";
import { tool } from "langchain";
const GOOGLE_API_KEY = "AIzaSyCchHTjgOYE6ExFnY58JXurUJkc0WbTPbw";
const GOOGLE_CX_ID = "03f63eee146df4e0f";

// const googleSearch = async (query) => {
//   console.log("Performing Google Search for:", query);

//   try {
//     const response = await fetch(
//       `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CX_ID}&q=${encodeURIComponent(
//         query
//       )}`
//     );

//     if (!response.ok) {
//       throw new Error(`Google API Error: ${response.statusText}`);
//     }

//     const data = await response.json();

//     if (!data.items || data.items.length === 0) {
//       return {
//         queryResult: "No results found for this query via Google Search.",
//       };
//     }

//     // Format top 5 results
//     const formattedResults = data.items
//       .slice(0, 5)
//       .map((item) => {
//         return `Title: ${item.title}\nSnippet: ${item.snippet}\nLink: ${item.link}\n---`;
//       })
//       .join("\n");

//     return {
//       queryResult: formattedResults,
//     };
//   } catch (error) {
//     console.error("Search failed:", error);
//     return {
//       queryResult: "An error occurred while searching Google.",
//     };
//   }
// };

const googleSearch = tool(
  async ({ query }) => {
    console.log("Performing Google Search for:", query);

    try {
      const response = await fetch(
        `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CX_ID}&q=${encodeURIComponent(
          query
        )}`
      );

      if (!response.ok)
        throw new Error(`Google API Error: ${response.statusText}`);

      const data = await response.json();

      if (!data.items || data.items.length === 0) {
        return "No results found.";
      }

      const formattedResults = data.items
        .slice(0, 5)
        .map(
          (item) =>
            `Title: ${item.title}\nSnippet: ${item.snippet}\nLink: ${item.link}`
        )
        .join("\n---\n");

      return `Search results for "${query}":\n\n${formattedResults}`;
    } catch (error) {
      console.error("Search failed:", error);
      return "Search error occurred.";
    }
  },
  {
    name: "google_search",
    description: "Search Google for product info, ingredients, or halal status",
    schema: z.object({
      query: z.string().describe("Search query"),
    }),
  }
);
export default googleSearch;
