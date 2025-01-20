const { MongoClient, ObjectId } = require("mongodb");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

const uri = "mongodb://localhost:27017";
const dbName = "auctionDB";
const collectionName = "auctions";
const dataFilePath = path.join(__dirname, "auctionData.json");

// Utility to handle MongoDB connection
// closes the connection after the callback is executed
async function connectMongoDb(callback) {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    await callback(collection);
  } catch (error) {
    console.error("Database error:", error);
  } finally {
    await client.close();
  }
}

// Create a readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Utility to ask a question
function askQuestion(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

// Utility to validate ObjectId
function validateObjectId(id) {
  if (!ObjectId.isValid(id)) {
    console.error("Invalid ID format. Please enter a valid MongoDB ObjectId.");
    return false;
  }
  return true;
}

// Seed auctionData.json into the database
async function seedData() {
  try {
    const data = JSON.parse(fs.readFileSync(dataFilePath, "utf8"));
    await connectMongoDb(async (collection) => {
      await collection.insertMany(data);
      console.log("Data seeded successfully from auctionData.json");
    });
  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    rl.close();
  }
}

// Confirm action with the user
async function confirmAction(message) {
  const answer = await askQuestion(`${message} (Y/N): `);
  return answer.trim().toUpperCase() === "Y";
}

// Delete all items from the database
async function deleteAllData() {
  const confirm = await confirmAction(
    "Are you sure you want to delete all data?"
  );
  if (confirm) {
    await connectMongoDb(async (collection) => {
      const result = await collection.deleteMany({});
      console.log(`Successfully deleted ${result.deletedCount} items.`);
    });
  } else {
    console.log("Deletion canceled.");
  }
  rl.close();
}

// Add a single item
async function addItem() {
  try {
    const item = {
      title: await askQuestion("Title: "),
      description: await askQuestion("Description: "),
      startingPrice: parseFloat(await askQuestion("Starting Price: ")),
      reservePrice: parseFloat(await askQuestion("Reserve Price: ")),
    };

    await connectMongoDb(async (collection) => {
      await collection.insertOne(item);
      console.log("New item added successfully:", item);
    });
  } catch (error) {
    console.error("Error adding item:", error);
  } finally {
    rl.close();
  }
}

// Delete a single item
async function deleteItem() {
  const id = await askQuestion("Enter the ID of the item to delete: ");
  if (!validateObjectId(id)) return rl.close();

  await connectMongoDb(async (collection) => {
    const result = await collection.deleteOne({
      _id: ObjectId.createFromHexString(id),
    });
    if (result.deletedCount > 0) {
      console.log(`Item with ID ${id} deleted successfully.`);
    } else {
      console.log(`No item found with ID ${id}.`);
    }
  });
  rl.close();
}

// Update a single item
async function updateItem() {
  const id = await askQuestion("Enter the ID of the item to update: ");
  if (!validateObjectId(id)) return rl.close();

  const updates = {};
  const title = await askQuestion("Title (leave blank to keep current): ");
  const description = await askQuestion(
    "Description (leave blank to keep current): "
  );
  const startingPrice = await askQuestion(
    "Starting Price (leave blank to keep current): "
  );
  const reservePrice = await askQuestion(
    "Reserve Price (leave blank to keep current): "
  );

  if (title) updates.title = title;
  if (description) updates.description = description;
  if (startingPrice) updates.startingPrice = parseFloat(startingPrice);
  if (reservePrice) updates.reservePrice = parseFloat(reservePrice);

  await connectMongoDb(async (collection) => {
    const result = await collection.updateOne(
      { _id: ObjectId.createFromHexString(id) },
      { $set: updates }
    );
    if (result.matchedCount > 0) {
      console.log("Item updated successfully:", updates);
    } else {
      console.log("No item found with that ID.");
    }
  });
  rl.close();
}

// Retrieve a single item
async function getItem() {
  const id = await askQuestion("Enter the ID of the item to retrieve: ");
  if (!validateObjectId(id)) return rl.close();

  await connectMongoDb(async (collection) => {
    const item = await collection.findOne({
      _id: ObjectId.createFromHexString(id),
    });
    if (item) {
      console.log("Retrieved item:", item);
    } else {
      console.log("No item found with that ID.");
    }
  });
  rl.close();
}

// Retrieve all items
async function getAllItems() {
  await connectMongoDb(async (collection) => {
    const items = await collection.find({}).toArray();
    console.log("Retrieved items:", items);
  });
  rl.close();
}

// Command-line arguments handling
const commands = {
  seed: seedData,
  deleteAllData: deleteAllData,
  addItem: addItem,
  deleteItem: deleteItem,
  updateItem: updateItem,
  getItem: getItem,
  getAllItems: getAllItems,
};

const args = process.argv.slice(2);
const command = commands[args[0]];

if (command) {
  command();
} else {
  console.log("Usage: node cliTool.js <command>");
  console.log("Commands:");
  console.log("  seed               Seed data from auctionData.json");
  console.log("  deleteAllData      Delete all data");
  console.log("  addItem            Add a single item");
  console.log("  deleteItem         Delete a single item");
  console.log("  updateItem         Update a single item");
  console.log("  getItem            Retrieve a single item");
  console.log("  getAllItems        Retrieve all items");
  rl.close();
}
