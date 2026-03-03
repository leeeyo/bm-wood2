/**
 * One-time migration: Convert MANAGER and STAFF roles to USER.
 * Run with: npx tsx scripts/migrate-roles.ts
 */
import mongoose from "mongoose";
import connectDB from "../lib/db/connection";
import { User } from "../lib/db/models";
import { UserRole } from "../types/models.types";

async function migrate() {
  await connectDB();

  const result = await User.updateMany(
    { role: { $in: ["manager", "staff"] } },
    { $set: { role: UserRole.USER } }
  );

  console.log(`Migrated ${result.modifiedCount} users from manager/staff to user role.`);
  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
