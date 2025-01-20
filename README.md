# Auction CLI Tool

This is a command-line interface (CLI) tool for managing auction items in a MongoDB database. The tool allows you to seed data, add, update, delete, and retrieve auction items.

## Prerequisites

- Node.js
- MongoDB

## Installation

1. Clone the repository:

   ```sh
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Install the dependencies:

   ```sh
   npm install
   ```

3. Ensure MongoDB is running on `mongodb://localhost:27017` or update the [uri](http://_vscodecontentref_/1) variable in [cliTool.js](http://_vscodecontentref_/2) to match your MongoDB connection string.

## Usage

Run the CLI tool with the following commands:

```sh
node cliTool.js <command>
```

## Commands

seed: Seed data from auctionData.json into the database.

deleteAllData: Delete all auction items from the database.

addItem: Add a single auction item.

deleteItem: Delete a single auction item by ID.

updateItem: Update a single auction item by ID.

getItem: Retrieve a single auction item by ID.

getAllItems: Retrieve all auction items.
