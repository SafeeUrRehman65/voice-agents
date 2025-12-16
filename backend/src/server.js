import app from "../src/app.js";
import { connectDB } from "../src/db/connectDB.js";
const PORT = process.env.PORT || 3000;

// connectDB()
//   .then(() =>
//     console.log("Connected established with Postgres SQL successfully")
//   )
//   .catch((err) => {
//     throw new Error("Some error occured while connecting to db", err);
//   });

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
