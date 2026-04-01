/**
 * Migration script: seeds missing collections into the Atlas DB
 * that already has users, merchants, and wallets.
 */
require("dotenv").config({ path: __dirname + "/.env" });
const mongoose = require("mongoose");

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  console.log("Connected to Atlas");

  // ── Get existing data ──
  const users = await db.collection("users").find({}).toArray();
  const merchants = await db.collection("merchants").find({}).toArray();

  console.log(`Found ${users.length} users, ${merchants.length} merchants`);

  const youssef = users.find((u) => u.email === "youssef@demo.com");
  const hafez = users.find((u) => u.email === "hafez@demo.com");
  const farag = users.find((u) => u.email === "farag@demo.com");

  if (!youssef || !hafez || !farag) {
    console.error("Could not find all 3 users!");
    process.exit(1);
  }

  const cafeBeirut = merchants.find((m) => m.name === "Café Beirut");
  const bloomFlowers = merchants.find((m) => m.name === "Bloom Flowers");
  const freshMart = merchants.find((m) => m.name === "FreshMart");

  // ── 1. Add missing merchants ──
  const existingNames = merchants.map((m) => m.name);
  const newMerchants = [];

  if (!existingNames.includes("FitZone Gym")) {
    newMerchants.push({
      name: "FitZone Gym",
      logo: "💪",
      category: "Health & Fitness",
      description:
        "Premium fitness centre with personal trainers and group classes.",
      earnRate: 8,
      minSpend: 0,
      bonusMultiplier: 1,
      redemptionEnabled: true,
      crossSmeRedemption: true,
      ownerId: youssef._id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  if (!existingNames.includes("Glamour Salon")) {
    newMerchants.push({
      name: "Glamour Salon",
      logo: "💇",
      category: "Beauty & Spa",
      description:
        "Full-service beauty salon offering haircuts, facials, and nail art.",
      earnRate: 12,
      minSpend: 30,
      bonusMultiplier: 1,
      redemptionEnabled: true,
      crossSmeRedemption: true,
      ownerId: youssef._id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  if (!existingNames.includes("WellCare Pharmacy")) {
    newMerchants.push({
      name: "WellCare Pharmacy",
      logo: "💊",
      category: "Pharmacy",
      description:
        "Trusted neighbourhood pharmacy with prescriptions, supplements and health essentials.",
      earnRate: 3,
      minSpend: 0,
      bonusMultiplier: 1,
      redemptionEnabled: true,
      crossSmeRedemption: true,
      ownerId: youssef._id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  if (newMerchants.length > 0) {
    const result = await db.collection("merchants").insertMany(newMerchants);
    console.log(`✅ Created ${result.insertedCount} new merchants`);
  } else {
    console.log("ℹ️  All merchants already exist");
  }

  // Re-fetch merchants to get IDs of new ones
  const allMerchants = await db.collection("merchants").find({}).toArray();
  const glamourSalon = allMerchants.find((m) => m.name === "Glamour Salon");
  const fitZone = allMerchants.find((m) => m.name === "FitZone Gym");
  const wellCare = allMerchants.find((m) => m.name === "WellCare Pharmacy");

  // ── 2. Seed Program Catalog ──
  const catCount = await db
    .collection("programcatalogs")
    .countDocuments()
    .catch(() => 0);
  if (catCount === 0) {
    await db.collection("programcatalogs").insertMany([
      {
        name: "EasyPoints",
        logo: "💎",
        currency: "EP",
        tiers: [],
        aedRate: 0.1,
        brandColor: "#6C63FF",
        createdAt: new Date(),
        updatedAt: new Date(),
        __v: 0,
      },
      {
        name: "Share",
        logo: "🟣",
        currency: "Points",
        tiers: ["Blue", "Silver", "Gold"],
        aedRate: 0.01,
        brandColor: "#8B5CF6",
        createdAt: new Date(),
        updatedAt: new Date(),
        __v: 0,
      },
      {
        name: "Etihad Guest",
        logo: "✈️",
        currency: "Miles",
        tiers: ["Bronze", "Silver", "Gold", "Platinum"],
        aedRate: 0.08,
        brandColor: "#D97706",
        createdAt: new Date(),
        updatedAt: new Date(),
        __v: 0,
      },
      {
        name: "Emirates Skywards",
        logo: "🔴",
        currency: "Miles",
        tiers: ["Blue", "Silver", "Gold", "Platinum"],
        aedRate: 0.07,
        brandColor: "#DC2626",
        createdAt: new Date(),
        updatedAt: new Date(),
        __v: 0,
      },
      {
        name: "Aura",
        logo: "🟡",
        currency: "Points",
        tiers: ["Member", "Silver", "Gold"],
        aedRate: 0.01,
        brandColor: "#F59E0B",
        createdAt: new Date(),
        updatedAt: new Date(),
        __v: 0,
      },
    ]);
    console.log("✅ Created 5 program catalog entries");
  } else {
    console.log(`ℹ️  Program catalog already has ${catCount} entries`);
  }

  // ── 3. Seed Linked Programs ──
  const lpCount = await db
    .collection("linkedprograms")
    .countDocuments()
    .catch(() => 0);
  if (lpCount === 0) {
    await db.collection("linkedprograms").insertMany([
      // Youssef: all 4 programs
      {
        userId: youssef._id,
        programName: "Share",
        programLogo: "🟣",
        balance: 2450,
        tier: "Gold",
        currency: "Points",
        aedRate: 0.01,
        brandColor: "#8B5CF6",
        createdAt: new Date(),
        updatedAt: new Date(),
        __v: 0,
      },
      {
        userId: youssef._id,
        programName: "Etihad Guest",
        programLogo: "✈️",
        balance: 18300,
        tier: "Silver",
        currency: "Miles",
        aedRate: 0.08,
        brandColor: "#D97706",
        createdAt: new Date(),
        updatedAt: new Date(),
        __v: 0,
      },
      {
        userId: youssef._id,
        programName: "Emirates Skywards",
        programLogo: "🔴",
        balance: 5120,
        tier: "Blue",
        currency: "Miles",
        aedRate: 0.07,
        brandColor: "#DC2626",
        createdAt: new Date(),
        updatedAt: new Date(),
        __v: 0,
      },
      {
        userId: youssef._id,
        programName: "Aura",
        programLogo: "🟡",
        balance: 1800,
        tier: "",
        currency: "Points",
        aedRate: 0.01,
        brandColor: "#F59E0B",
        createdAt: new Date(),
        updatedAt: new Date(),
        __v: 0,
      },
      // Hafez: Share + Etihad
      {
        userId: hafez._id,
        programName: "Share",
        programLogo: "🟣",
        balance: 900,
        tier: "Silver",
        currency: "Points",
        aedRate: 0.01,
        brandColor: "#8B5CF6",
        createdAt: new Date(),
        updatedAt: new Date(),
        __v: 0,
      },
      {
        userId: hafez._id,
        programName: "Etihad Guest",
        programLogo: "✈️",
        balance: 4200,
        tier: "Bronze",
        currency: "Miles",
        aedRate: 0.08,
        brandColor: "#D97706",
        createdAt: new Date(),
        updatedAt: new Date(),
        __v: 0,
      },
      // Mo Farag: all 4 programs
      {
        userId: farag._id,
        programName: "Share",
        programLogo: "🟣",
        balance: 3100,
        tier: "Gold",
        currency: "Points",
        aedRate: 0.01,
        brandColor: "#8B5CF6",
        createdAt: new Date(),
        updatedAt: new Date(),
        __v: 0,
      },
      {
        userId: farag._id,
        programName: "Etihad Guest",
        programLogo: "✈️",
        balance: 22500,
        tier: "Gold",
        currency: "Miles",
        aedRate: 0.08,
        brandColor: "#D97706",
        createdAt: new Date(),
        updatedAt: new Date(),
        __v: 0,
      },
      {
        userId: farag._id,
        programName: "Emirates Skywards",
        programLogo: "🔴",
        balance: 8700,
        tier: "Silver",
        currency: "Miles",
        aedRate: 0.07,
        brandColor: "#DC2626",
        createdAt: new Date(),
        updatedAt: new Date(),
        __v: 0,
      },
      {
        userId: farag._id,
        programName: "Aura",
        programLogo: "🟡",
        balance: 1200,
        tier: "",
        currency: "Points",
        aedRate: 0.01,
        brandColor: "#F59E0B",
        createdAt: new Date(),
        updatedAt: new Date(),
        __v: 0,
      },
    ]);
    console.log("✅ Created 10 linked programs");
  } else {
    console.log(`ℹ️  Linked programs already has ${lpCount} entries`);
  }

  // ── 4. Seed Offers ──
  const offerCount = await db
    .collection("offers")
    .countDocuments()
    .catch(() => 0);
  if (offerCount === 0) {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const offers = [
      {
        merchantId: cafeBeirut._id,
        title: "Double Points Friday!",
        description:
          "Earn 2x EasyPoints on all orders this Friday. Don't miss out!",
        type: "bonus",
        value: 2,
        startsAt: now,
        endsAt: nextWeek,
        isActive: true,
        createdAt: now,
        updatedAt: now,
        __v: 0,
      },
      {
        merchantId: freshMart._id,
        title: "Weekend Grocery Deal",
        description: "Get 3x points on all grocery purchases this weekend!",
        type: "bonus",
        value: 3,
        startsAt: now,
        endsAt: nextWeek,
        isActive: true,
        createdAt: now,
        updatedAt: now,
        __v: 0,
      },
      {
        merchantId: cafeBeirut._id,
        title: "Free Coffee at 200 EP",
        description:
          "Redeem just 200 EP for a complimentary Arabic coffee. Limited time offer!",
        type: "freebie",
        value: 200,
        startsAt: now,
        endsAt: nextMonth,
        isActive: true,
        createdAt: now,
        updatedAt: now,
        __v: 0,
      },
    ];

    if (glamourSalon) {
      offers.push(
        {
          merchantId: glamourSalon._id,
          title: "50 Bonus EP on Orders Over 100 AED",
          description:
            "Spend 100 AED or more on beauty services and get 50 bonus EasyPoints automatically.",
          type: "bonus",
          value: 50,
          startsAt: now,
          endsAt: nextMonth,
          isActive: true,
          createdAt: now,
          updatedAt: now,
          __v: 0,
        },
        {
          merchantId: glamourSalon._id,
          title: "20% Off Facial Treatments",
          description: "Redeem EP and get 20% discount on premium facials.",
          type: "discount",
          value: 20,
          startsAt: now,
          endsAt: nextWeek,
          isActive: true,
          createdAt: now,
          updatedAt: now,
          __v: 0,
        },
      );
    }

    if (fitZone) {
      offers.push({
        merchantId: fitZone._id,
        title: "New Year Fitness 2x",
        description: "Earn double EasyPoints on every gym visit this month!",
        type: "bonus",
        value: 2,
        startsAt: now,
        endsAt: nextMonth,
        isActive: true,
        createdAt: now,
        updatedAt: now,
        __v: 0,
      });
    }

    if (wellCare) {
      offers.push({
        merchantId: wellCare._id,
        title: "Free Vitamin Pack at 150 EP",
        description: "Redeem 150 EP for a complimentary daily vitamin pack.",
        type: "freebie",
        value: 150,
        startsAt: now,
        endsAt: nextMonth,
        isActive: true,
        createdAt: now,
        updatedAt: now,
        __v: 0,
      });
    }

    await db.collection("offers").insertMany(offers);
    console.log(`✅ Created ${offers.length} offers`);
  } else {
    console.log(`ℹ️  Offers already has ${offerCount} entries`);
  }

  // ── 5. Drop legacy mockedprograms collection ──
  try {
    await db.collection("mockedprograms").drop();
    console.log("✅ Dropped legacy mockedprograms collection");
  } catch (_) {
    // collection might not exist
  }

  // ── Summary ──
  const finalCounts = {
    users: await db.collection("users").countDocuments(),
    merchants: await db.collection("merchants").countDocuments(),
    wallets: await db.collection("wallets").countDocuments(),
    programcatalogs: await db.collection("programcatalogs").countDocuments(),
    linkedprograms: await db.collection("linkedprograms").countDocuments(),
    offers: await db.collection("offers").countDocuments(),
  };
  console.log("\n🎉 Migration complete! Final counts:");
  console.log(JSON.stringify(finalCounts, null, 2));

  process.exit(0);
}

migrate().catch((e) => {
  console.error("MIGRATION FAILED:", e.message);
  process.exit(1);
});
