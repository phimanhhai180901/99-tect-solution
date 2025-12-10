import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

async function testConnection() {
  console.log("Testing Prisma connection...\n");

  const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
  const prisma = new PrismaClient({ adapter });

  try {
    // Test: Create a user
    console.log("1. Creating a test user...");
    const newUser = await prisma.user.create({
      data: {
        name: "Test User",
        type: "test",
      },
    });
    console.log("   ✓ Created:", newUser);

    // Test: Read users
    console.log("\n2. Reading all users...");
    const users = await prisma.user.findMany();
    console.log("   ✓ Found", users.length, "user(s)");

    // Test: Update user
    console.log("\n3. Updating the user...");
    const updated = await prisma.user.update({
      where: { id: newUser.id },
      data: { name: "Updated Test User" },
    });
    console.log("   ✓ Updated:", updated);

    // Test: Delete user
    console.log("\n4. Deleting the user...");
    await prisma.user.delete({
      where: { id: newUser.id },
    });
    console.log("   ✓ Deleted successfully");

    console.log("\n✅ All Prisma operations work correctly!");
  } catch (error) {
    console.error("\n❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

