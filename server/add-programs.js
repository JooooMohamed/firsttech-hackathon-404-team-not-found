require("dotenv").config();
const m = require("mongoose");

m.connect(process.env.MONGODB_URI)
  .then(async () => {
    const db = m.connection.db;

    const catalog = db.collection("programcatalogs");
    const progs = [
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

    for (const p of progs) {
      const exists = await catalog.findOne({ name: p.name });
      if (!exists) {
        await catalog.insertOne(p);
        console.log("Added catalog:", p.name);
      } else {
        console.log("Exists:", p.name);
      }
    }

    const users = db.collection("users");
    const y = await users.findOne({ email: "youssef@demo.com" });
    if (!y) {
      console.log("No youssef");
      process.exit(1);
    }

    const linked = db.collection("linkedprograms");
    const lps = [
      {
        userId: y._id,
        programName: "ADNOC Rewards",
        programLogo: "⛽",
        balance: 1860,
        tier: "Silver",
        currency: "Points",
        aedRate: 0.01,
        brandColor: "#00843D",
      },
      {
        userId: y._id,
        programName: "Smiles",
        programLogo: "😊",
        balance: 12300,
        tier: "Gold",
        currency: "Points",
        aedRate: 0.005,
        brandColor: "#7B2D8E",
      },
      {
        userId: y._id,
        programName: "FAB Rewards",
        programLogo: "🏦",
        balance: 3100,
        tier: "Gold",
        currency: "Points",
        aedRate: 0.02,
        brandColor: "#003087",
      },
      {
        userId: y._id,
        programName: "Blue Rewards",
        programLogo: "💙",
        balance: 5500,
        tier: "Silver",
        currency: "Points",
        aedRate: 0.01,
        brandColor: "#1E90FF",
      },
    ];

    for (const lp of lps) {
      const exists = await linked.findOne({
        userId: y._id,
        programName: lp.programName,
      });
      if (!exists) {
        await linked.insertOne(lp);
        console.log("Linked:", lp.programName, lp.balance);
      } else {
        console.log("Exists:", lp.programName);
      }
    }

    console.log("Done!");
    process.exit(0);
  })
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
