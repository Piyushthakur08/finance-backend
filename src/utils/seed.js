require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Record = require("../models/Record");
const connectDB = require("../config/database");

/*
  Seeds the database with sample users and financial records.
  Run with: npm run seed
  
  This creates:
    - 1 admin user
    - 1 analyst user
    - 1 viewer user
    - ~30 sample financial records across different categories
*/

const users = [
  {
    name: "Rahul Sharma",
    email: "admin@example.com",
    password: "admin123",
    role: "admin",
    isActive: true,
  },
  {
    name: "Priya Patel",
    email: "analyst@example.com",
    password: "analyst123",
    role: "analyst",
    isActive: true,
  },
  {
    name: "Amit Kumar",
    email: "viewer@example.com",
    password: "viewer123",
    role: "viewer",
    isActive: true,
  },
];

const generateRecords = (adminId) => {
  const records = [
    // Income records
    { amount: 75000, type: "income", category: "salary", date: new Date("2024-01-15"), description: "January salary", createdBy: adminId },
    { amount: 75000, type: "income", category: "salary", date: new Date("2024-02-15"), description: "February salary", createdBy: adminId },
    { amount: 75000, type: "income", category: "salary", date: new Date("2024-03-15"), description: "March salary", createdBy: adminId },
    { amount: 15000, type: "income", category: "freelance", date: new Date("2024-01-20"), description: "Freelance web project", createdBy: adminId },
    { amount: 8000, type: "income", category: "freelance", date: new Date("2024-03-05"), description: "Logo design project", createdBy: adminId },
    { amount: 5000, type: "income", category: "investment", date: new Date("2024-02-28"), description: "Dividend from mutual funds", createdBy: adminId },
    { amount: 12000, type: "income", category: "investment", date: new Date("2024-03-30"), description: "Stock sale profit", createdBy: adminId },

    // Expense records
    { amount: 18000, type: "expense", category: "rent", date: new Date("2024-01-01"), description: "January apartment rent", createdBy: adminId },
    { amount: 18000, type: "expense", category: "rent", date: new Date("2024-02-01"), description: "February apartment rent", createdBy: adminId },
    { amount: 18000, type: "expense", category: "rent", date: new Date("2024-03-01"), description: "March apartment rent", createdBy: adminId },
    { amount: 3500, type: "expense", category: "utilities", date: new Date("2024-01-10"), description: "Electricity and water bill", createdBy: adminId },
    { amount: 2800, type: "expense", category: "utilities", date: new Date("2024-02-10"), description: "Electricity and water bill", createdBy: adminId },
    { amount: 3200, type: "expense", category: "utilities", date: new Date("2024-03-10"), description: "Electricity and internet bill", createdBy: adminId },
    { amount: 6000, type: "expense", category: "groceries", date: new Date("2024-01-08"), description: "Monthly groceries", createdBy: adminId },
    { amount: 5500, type: "expense", category: "groceries", date: new Date("2024-02-07"), description: "Monthly groceries", createdBy: adminId },
    { amount: 7000, type: "expense", category: "groceries", date: new Date("2024-03-09"), description: "Monthly groceries + household items", createdBy: adminId },
    { amount: 2500, type: "expense", category: "transportation", date: new Date("2024-01-12"), description: "Fuel and metro pass", createdBy: adminId },
    { amount: 1800, type: "expense", category: "transportation", date: new Date("2024-02-14"), description: "Cab rides and fuel", createdBy: adminId },
    { amount: 3000, type: "expense", category: "transportation", date: new Date("2024-03-11"), description: "Car service + fuel", createdBy: adminId },
    { amount: 4000, type: "expense", category: "entertainment", date: new Date("2024-01-25"), description: "Movie, dinner, weekend outing", createdBy: adminId },
    { amount: 2000, type: "expense", category: "entertainment", date: new Date("2024-02-20"), description: "Netflix and restaurant", createdBy: adminId },
    { amount: 8500, type: "expense", category: "healthcare", date: new Date("2024-02-05"), description: "Doctor visit and medicines", createdBy: adminId },
    { amount: 15000, type: "expense", category: "education", date: new Date("2024-01-30"), description: "Online course subscription", createdBy: adminId },
    { amount: 3500, type: "expense", category: "other", date: new Date("2024-03-18"), description: "Gift for friend's wedding", createdBy: adminId },
    { amount: 1200, type: "expense", category: "other", date: new Date("2024-02-22"), description: "Phone case and accessories", createdBy: adminId },
  ];

  return records;
};

const seedDB = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Record.deleteMany({});
    console.log("Cleared existing data.");

    // Create users (password hashing happens via the pre-save hook)
    const createdUsers = await User.create(users);
    const adminUser = createdUsers.find((u) => u.role === "admin");
    console.log(`Created ${createdUsers.length} users.`);

    // Create records
    const records = generateRecords(adminUser._id);
    await Record.insertMany(records);
    console.log(`Created ${records.length} financial records.`);

    console.log("\nSeed complete. You can log in with:");
    console.log("  Admin:   admin@example.com   / admin123");
    console.log("  Analyst: analyst@example.com / analyst123");
    console.log("  Viewer:  viewer@example.com  / viewer123");

    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  }
};

seedDB();
