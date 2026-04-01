const mongoose = require("mongoose");
require("dotenv").config({ path: __dirname + "/.env" });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const merchants = db.collection("merchants");

  const updates = [
    {
      name: "Café Beirut",
      description:
        "Authentic Lebanese cuisine with freshly baked manakeesh, shawarma wraps and specialty Arabic coffee.",
    },
    {
      name: "Bloom Flowers",
      description:
        "Premium flower boutique offering handcrafted bouquets, event arrangements and same-day delivery across the UAE.",
    },
    {
      name: "FreshMart",
      description:
        "Your neighbourhood grocery store with farm-fresh produce, organic selections and everyday essentials.",
    },
  ];

  for (const u of updates) {
    const res = await merchants.updateOne(
      { name: u.name },
      { $set: { description: u.description } },
    );
    console.log(`${u.name}: ${res.modifiedCount ? "updated" : "not found"}`);
  }

  await mongoose.disconnect();
  console.log("Done");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
