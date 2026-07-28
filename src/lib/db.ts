import mysql, { type Pool } from "mysql2/promise";

const LOCAL_DEV_DB_URL = "mysql://root:nuimipasa@localhost:3306/sofia_db";

function resolveDatabaseUrl() {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  // Local development fallback only. Configure DATABASE_URL in production.
  return LOCAL_DEV_DB_URL;
}

const databaseUrl = resolveDatabaseUrl();

let pool: Pool | null = null;
let triedPasswordlessFallback = false;

type DbValue = string | number | boolean | Date | Buffer | null;

function createPoolFromUrl(urlValue: string, forceEmptyPassword = false) {
  const parsed = new URL(urlValue);
  const username = decodeURIComponent(parsed.username);
  const localhostHost = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
  const useSocketFallback = forceEmptyPassword && localhostHost && username === "root";

  return mysql.createPool({
    ...(useSocketFallback
      ? { socketPath: "/run/mysqld/mysqld.sock" }
      : {
          host: parsed.hostname,
          port: parsed.port ? Number(parsed.port) : 3306,
        }),
    user: username,
    password: forceEmptyPassword ? "" : decodeURIComponent(parsed.password),
    database: parsed.pathname.replace(/^\//, ""),
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0,
    charset: "utf8mb4",
    multipleStatements: true,
  });
}

function shouldTryPasswordlessFallback(error: unknown) {
  if (triedPasswordlessFallback) return false;
  if (process.env.DATABASE_URL) return false;

  const parsed = new URL(databaseUrl);
  if (parsed.hostname !== "localhost" && parsed.hostname !== "127.0.0.1") return false;
  if (decodeURIComponent(parsed.username) !== "root") return false;

  const code = (error as { code?: string })?.code;
  return code === "ER_ACCESS_DENIED_NO_PASSWORD_ERROR" || code === "ER_ACCESS_DENIED_ERROR";
}

function getPool() {
  if (!pool) {
    pool = createPoolFromUrl(databaseUrl);
  }

  return pool;
}

export async function dbQuery<T = unknown>(
  sql: string,
  params: unknown[] = []
) {
  try {
    const [rows] = await getPool().query(sql, params);
    return rows as T;
  } catch (error) {
    if (!shouldTryPasswordlessFallback(error)) {
      throw error;
    }

    triedPasswordlessFallback = true;
    if (pool) {
      await pool.end().catch(() => undefined);
    }
    pool = createPoolFromUrl(databaseUrl, true);

    const [rows] = await getPool().query(sql, params);
    return rows as T;
  }
}

export async function dbExecute(sql: string, params: DbValue[] = []) {
  try {
    const [result] = await getPool().execute(sql, params as never[]);
    return result;
  } catch (error) {
    if (!shouldTryPasswordlessFallback(error)) {
      throw error;
    }

    triedPasswordlessFallback = true;
    if (pool) {
      await pool.end().catch(() => undefined);
    }
    pool = createPoolFromUrl(databaseUrl, true);

    const [result] = await getPool().execute(sql, params as never[]);
    return result;
  }
}

export async function dbPing() {
  const rows = await dbQuery<Array<{ ok: number }>>("SELECT 1 AS ok");
  return rows[0]?.ok === 1;
}

export async function dbRaw(sql: string) {
  try {
    const [result] = await getPool().query(sql);
    return result;
  } catch (error) {
    if (!shouldTryPasswordlessFallback(error)) {
      throw error;
    }

    triedPasswordlessFallback = true;
    if (pool) {
      await pool.end().catch(() => undefined);
    }
    pool = createPoolFromUrl(databaseUrl, true);

    const [result] = await getPool().query(sql);
    return result;
  }
}
