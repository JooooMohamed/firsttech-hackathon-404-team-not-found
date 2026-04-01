require("dotenv").config({ path: __dirname + "/.env" });
const mongoose = require("mongoose");

async function inspect() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const cols = await db.listCollections().toArray();
  console.log("Collections:", cols.map((c) => c.name).join(", "));

  const users = await db
    .collection("users")
    .find({}, { projection: { name: 1, email: 1, roles: 1, merchantId: 1 } })
    .toArray();
  console.log("\nUsers:", users.length);
  users.forEach((u) =>
    console.log(
      "  " +
        u.name +
        " | " +
        u.email +
        " | " +
        JSON.stringify(u.roles) +
        " | merchant:" +
        u.merchantId,
    ),
  );

  const merchants = await db
    .collection("merchants")
    .find({}, { projection: { name: 1, _id: 1 } })
    .toArray();
  console.log("\nMerchants:", merchants.length);
  merchants.forEach((m) => console.log("  " + m._id + " | " + m.name));

  const counts = {
    wallets: await db.collection("wallets").countDocuments(),
    linkedprograms: await db
      .collection("linkedprograms")
      .countDocuments()
      .catch(() => 0),
    programcatalogs: await db
      .collection("programcatalogs")
      .countDocuments()
      .catch(() => 0),
    offers: await db
      .collection("offers")
      .countDocuments()
      .catch(() => 0),
    mockedprograms: await db
      .collection("mockedprograms")
      .countDocuments()
      .catch(() => 0),
    transactions: await db
      .collection("transactions")
      .countDocuments()
      .catch(() => 0),
    qrsessions: await db
      .collection("qrsessions")
      .countDocuments()
      .catch(() => 0),
  };
  console.log("\nCounts:", JSON.stringify(counts, null, 2));

  process.exit(0);
}

inspect().catch((e) => {
  console.error("CONNECT FAIL:", e.message);
  process.exit(1);
});
