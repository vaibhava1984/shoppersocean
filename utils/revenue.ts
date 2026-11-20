export async function ensureRevenueSchema(db: any) {
  const statements = [
    "ALTER TABLE payments ADD COLUMN gateway_fee_inr REAL",
    "ALTER TABLE payments ADD COLUMN gateway_name TEXT",
    "ALTER TABLE payments ADD COLUMN gateway_fee_checked_at TEXT",
    "ALTER TABLE payments ADD COLUMN sale_country TEXT",
    "ALTER TABLE payments ADD COLUMN sale_region TEXT",
    "ALTER TABLE payments ADD COLUMN sale_city TEXT",
  ];
  for (const statement of statements) {
    try { await db.prepare(statement).run(); }
    catch (error) {
      const message = String(error).toLowerCase();
      if (message.includes("duplicate column") || message.includes("already exists")) continue;
      throw error;
    }
  }
}
