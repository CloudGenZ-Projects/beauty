import mysql, { Pool } from "mysql2/promise";

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "wordpress_db",
      port: Number(process.env.DB_PORT || 3306),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return pool;
}

let tableChecked = false;

export async function ensureTableExists(db: Pool): Promise<void> {
  if (tableChecked) return;
  await db.execute(`
    CREATE TABLE IF NOT EXISTS \`beautyshop_users\` (
      \`id\` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
      \`email\` varchar(100) NOT NULL,
      \`password\` varchar(255) NOT NULL,
      \`first_name\` varchar(50) DEFAULT NULL,
      \`last_name\` varchar(50) DEFAULT NULL,
      \`woocommerce_customer_id\` bigint(20) DEFAULT NULL,
      \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      \`status\` varchar(20) NOT NULL DEFAULT 'active',
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`email\` (\`email\`),
      KEY \`woocommerce_customer_id\` (\`woocommerce_customer_id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  tableChecked = true;
}

export async function query(sql: string, params: any[] = []): Promise<any> {
  const db = getPool();
  await ensureTableExists(db);
  const [results] = await db.execute(sql, params);
  return results;
}
