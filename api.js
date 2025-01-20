const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
const port = process.env.PORT || 3000;
const uri = process.env.MONGO_URI || "mongodb://localhost:27017";
const dbName = "auctionDB";
const collectionName = "auctions";

// Middleware for parsing JSON for future POST/PUT requests
app.use(express.json());

// Utility to handle MongoDB connection
async function withMongoDb(callback) {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    return await callback(collection);
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    await client.close();
  }
}

// Route: Search auctions by keyword
app.get("/search", async (req, res) => {
  const keyword = req.query.keyword;
  if (!keyword) {
    return res
      .status(400)
      .json({ error: "Keyword query parameter is required" });
  }

  try {
    const results = await withMongoDb((collection) =>
      collection
        .find({
          $or: [
            { title: { $regex: keyword, $options: "i" } },
            { description: { $regex: keyword, $options: "i" } },
          ],
        })
        .toArray()
    );
    res.json(results);
  } catch (error) {
    console.error("Error retrieving data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
});
