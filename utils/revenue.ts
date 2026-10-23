export async function ensureRevenueSchema(db: any) {
  const statements = [
    "ALTER TABLE payments ADD COLUMN gateway_fee_inr REAL",
    "ALTER TABLE payments ADD COLUMN gateway_name TEXT",
    "ALTER TABLE payments ADD COLUMN gateway_fee_checked_at TEXT",
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
