import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db, hasDatabase } from "@/db";
import { envValue, runtimeEnv } from "@/lib/runtime-env";

export async function GET() {
  let databaseReachable = false;
  let databaseError: string | null = null;
  let tables: string[] = [];
  let missingColumns: string[] = [];
  let userCount: number | null = null;
  let credentialAccounts: number | null = null;
  let roles: { role: string; count: number }[] = [];
  if (hasDatabase) {
    try {
      await db.execute(sql`select 1`);
      databaseReachable = true;
      const rows = await db.execute<{ table_name: string }>(
        sql`select table_name from information_schema.tables where table_schema = 'public'`,
      );
      tables = rows.rows.map((row) => row.table_name);
      if (tables.includes("user")) {
        const cols = await db.execute<{ column_name: string }>(
          sql`select column_name from information_schema.columns where table_schema = 'public' and table_name = 'user'`,
        );
        const names = cols.rows.map((row) => row.column_name);
        missingColumns = ["role", "headline"].filter(
          (column) => !names.includes(column),
        );
        const countRows = await db.execute<{ count: number }>(
          sql`select count(*)::int as count from "user"`,
        );
        userCount = countRows.rows[0]?.count ?? 0;
        const roleRows = await db.execute<{ role: string; count: number }>(
          sql`select role, count(*)::int as count from "user" group by role`,
        );
        roles = roleRows.rows;
      }
      if (tables.includes("account")) {
        const accountRows = await db.execute<{ count: number }>(
          sql`select count(*)::int as count from "account" where provider_id = 'credential'`,
        );
        credentialAccounts = accountRows.rows[0]?.count ?? 0;
      }
    } catch (error) {
      databaseError = error instanceof Error ? error.message : "Unknown error";
    }
  }
  const requiredTables = [
    "user",
    "session",
    "account",
    "verification",
    "course",
    "lesson",
    "enrollment",
  ];
  const missingTables = requiredTables.filter((table) => !tables.includes(table));

  const isDev = process.env.NODE_ENV !== "production";
  return NextResponse.json({
    ok: true,
    database: hasDatabase,
    databaseReachable,
    storage: Boolean(runtimeEnv.BUCKET),
    auth: Boolean(envValue<string>("BETTER_AUTH_SECRET")),
    ...(isDev
      ? {
          databaseError,
          missingTables,
          missingColumns,
          users: userCount,
          credentialAccounts,
          roles,
        }
      : {}),
  });
}
