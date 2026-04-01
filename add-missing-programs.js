/**
 * Add 4 missing loyalty programs to Atlas: ADNOC Rewards, Smiles, FAB Rewards, Blue Rewards
 * Run: node server/add-missing-programs.js
 */
require("dotenv").config({ path: __dirname + "/server/.env" });
const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("easypoints");

    // 1. Add missing programs to catalog
    const catalog = db.collection("programcatalogs");
    const newPrograms = [
      {
        name: "ADNOC Rewards",
        logo: "⛽",
        currency: "Points",
        tiers: ["Classic", "Silver", "Gold", "Platinum"],
        aedRate: 0.01,
        brandColor: "#00843D",
      },
      {
        name: "Smiles",
        logo: "😊",
        currency: "Points",
        tiers: ["Member", "Silver", "Gold"],
        aedRate: 0.005,
        brandColor: "#7B2D8E",
      },
      {
        name: "FAB Rewards",
        logo: "🏦",
        currency: "Points",
        tiers: ["Classic", "Gold", "Platinum"],
        aedRate: 0.02,
        brandColor: "#003087",
      },
      {
        name: "Blue Rewards",
        logo: "💙",
        currency: "Points",
        tiers: ["Blue", "Silver", "Gold"],
        aedRate: 0.01,
        brandColor: "#1E90FF",
      },
    ];

    for (const prog of newPrograms) {
      const exists = await catalog.findOne({ name: prog.name });
      if (!exists) {
        await catalog.insertOne(prog);
        console.log(`✅ Added catalog: ${prog.name}`);
      } else {
        console.log(`⏭️  Already exists: ${prog.name}`);
      }
    }

    // 2. Add linked programs for youssef (first user)
    const users = db.collection("users");
    const youssef = await users.findOne({ email: "youssef@demo.com" });
    if (!youssef) {
      console.log("❌ youssef@demo.com not found");
      return;
    }

    const linked = db.collection("linkedprograms");
    const newLinked = [
      {
        userId: youssef._id,
        programName: "ADNOC Rewards",
        programLogo: "⛽",
        balance: 1860,
        tier: "Silver",
        currency: "Points",
        aedRate: 0.01,
        brandColor: "#00843D",
      },
      {
        userId: youssef._id,
        programName: "Smiles",
        programLogo: "😊",
        balance: 12300,
        tier: "Gold",
        currency: "Points",
        aedRate: 0.005,
        brandColor: "#7B2D8E",
      },
      {
        userId: youssef._id,
        programName: "FAB Rewards",
        programLogo: "🏦",
        balance: 3100,
        tier: "Gold",
        currency: "Points",
        aedRate: 0.02,
        brandColor: "#003087",
      },
      {
        userId: youssef._id,
        programName: "Blue Rewards",
        programLogo: "💙",
        balance: 5500,
        tier: "Silver",
        currency: "Points",
        aedRate: 0.01,
        brandColor: "#1E90FF",
      },
    ];

    for (const lp of newLinked) {
      const exists = await linked.findOne({
        userId: youssef._id,
        programName: lp.programName,
      });
      if (!exists) {
        await linked.insertOne(lp);
        console.log(
          `✅ Linked for youssef: ${lp.programName} (${lp.balance} ${lp.currency})`,
        );
      } else {
        console.log(`⏭️  Already linked: ${lp.programName}`);
      }
    }

    console.log("\n🎉 Done! All 8 programs now available.");
  } finally {
    await client.close();
  }
}

run().catch(console.error);
