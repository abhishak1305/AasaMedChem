require("dotenv").config();
const { Client } = require("pg");
const bcrypt = require("bcryptjs");

async function seed() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  await client.connect();

  console.log("Seeding databases with default credentials...");

  const adminPasswordHash = await bcrypt.hash("adminSecurePassword123", 10);
  const sellerPasswordHash = await bcrypt.hash("sellerSecurePassword123", 10);

  // Insert seed roles
  await client.query(`
    INSERT INTO users (id, email, password_hash, role)
    VALUES 
      (gen_random_uuid(), 'admin@aasamedchem.com', $1, 'ADMIN'),
      (gen_random_uuid(), 'seller@aasamedchem.com', $2, 'SELLER')
    ON CONFLICT (email) DO NOTHING;
  `, [adminPasswordHash, sellerPasswordHash]);

  console.log("Seeding completed successfully.");
  await client.end();
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
