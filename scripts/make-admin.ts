import "dotenv/config";
import { Client } from "pg";

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: npm run db:make-admin -- you@example.com");
    process.exit(1);
  }
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const result = await client.query(
      `update "user" set role = 'admin', updated_at = now() where lower(email) = lower($1)`,
      [email],
    );
    if (result.rowCount === 0) {
      console.error(
        `No user found with email ${email}. Create the account on /signup first.`,
      );
      process.exit(1);
    }
    console.log(`✓ ${email} is now an admin. Log out and back in.`);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
