import { defineConfig } from "drizzle-kit";

// Database is optional - the app uses localStorage for widget and layout persistence
// Only needed if you want to use database features in the future
if (!process.env.DATABASE_URL) {
  console.warn("⚠️  DATABASE_URL not set - database features will be unavailable.");
  console.warn("   This is OK! The app uses localStorage for persistence.");
  console.warn("   To enable database features, add DATABASE_URL to your .env file.");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "postgresql://localhost:5432/placeholder",
  },
});
