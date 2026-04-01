// seed-atlas.js — run with: mongosh "mongodb+srv://..." --file seed-atlas.js

const existingUsers = db.users.countDocuments();
if (existingUsers > 0) {
  print("Already seeded: " + existingUsers + " users. Skipping.");
  quit();
}

print("Seeding Atlas...");

// bcrypt hash of "demo123" (10 rounds)
const pw = "$2b$10$8K1p/N1gR3pMgG.5RgZlYeKXdQS9XqCQhm3JtVGlFCVT1KXqdqPu";

// Users
const youssef = db.users.insertOne({
  name: "youssef Ahmed",
  email: "youssef@demo.com",
  phone: "+971501234567",
  password: pw,
  roles: ["member", "staff", "admin"],
  consentGiven: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});
const Hafez = db.users.insertOne({
  name: "Hafez Hassan",
  email: "hafez@demo.com",
  phone: "+971509876543",
  password: pw,
  roles: ["member", "staff", "admin"],
  consentGiven: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});
const Farag = db.users.insertOne({
  name: "Farag Ali",
  email: "farag@demo.com",
  phone: "+971505551234",
  password: pw,
  roles: ["member", "staff", "admin"],
  consentGiven: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});
print("  3 users created");

// Merchants
const cafe = db.merchants.insertOne({
  name: "Café Beirut",
  category: "Food & Beverage",
  earnRate: 10,
  isActive: true,
  ownerId: Hafez.insertedId,
  createdAt: new Date(),
  updatedAt: new Date(),
});
db.merchants.insertOne({
  name: "Bloom Flowers",
  category: "Retail",
  earnRate: 15,
  isActive: true,
  ownerId: Hafez.insertedId,
  createdAt: new Date(),
  updatedAt: new Date(),
});
db.merchants.insertOne({
  name: "FreshMart",
  category: "Grocery",
  earnRate: 5,
  isActive: true,
  ownerId: Farag.insertedId,
  createdAt: new Date(),
  updatedAt: new Date(),
});
print("  3 merchants created");

// Link all users to Café Beirut
db.users.updateOne(
  { _id: youssef.insertedId },
  { $set: { merchantId: cafe.insertedId } },
);
db.users.updateOne(
  { _id: Hafez.insertedId },
  { $set: { merchantId: cafe.insertedId } },
);
db.users.updateOne(
  { _id: Farag.insertedId },
  { $set: { merchantId: cafe.insertedId } },
);
print("  users linked to Café Beirut");

// Wallets
db.wallets.insertMany([
  {
    userId: youssef.insertedId,
    merchantId: null,
    balance: 500,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    userId: Hafez.insertedId,
    merchantId: null,
    balance: 200,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    userId: Farag.insertedId,
    merchantId: null,
    balance: 100,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]);
print("  3 wallets created");

// Mocked Programs
db.mockedprograms.insertMany([
  {
    userId: youssef.insertedId,
    programName: "Share",
    programLogo: "P",
    balance: 2450,
    tier: "Gold",
    currency: "Points",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    userId: youssef.insertedId,
    programName: "Etihad Guest",
    programLogo: "E",
    balance: 18300,
    tier: "Silver",
    currency: "Miles",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    userId: youssef.insertedId,
    programName: "Emirates Skywards",
    programLogo: "S",
    balance: 5120,
    tier: "Blue",
    currency: "Miles",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    userId: youssef.insertedId,
    programName: "Aura",
    programLogo: "A",
    balance: 1800,
    tier: "",
    currency: "Points",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    userId: Hafez.insertedId,
    programName: "Share",
    programLogo: "P",
    balance: 900,
    tier: "Silver",
    currency: "Points",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    userId: Hafez.insertedId,
    programName: "Etihad Guest",
    programLogo: "E",
    balance: 4200,
    tier: "Bronze",
    currency: "Miles",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]);
print("  6 mocked programs created");

print("\n=== SEED COMPLETE ===");
print("Users:     " + db.users.countDocuments());
print("Merchants: " + db.merchants.countDocuments());
print("Wallets:   " + db.wallets.countDocuments());
print("Programs:  " + db.mockedprograms.countDocuments());
