import fs from "fs/promises";
import path from "path";
import {
  deleteDbRecord,
  exportSqlDump,
  exportTableCsv,
  getDbRecords,
  listDbTables,
  optimizeTable,
  updateDbRecord,
} from "@/lib/content-db";
import { dbRaw } from "@/lib/db";

const BACKUP_DIR = path.join(process.cwd(), "data", "db-backups");

export async function ensureBackupDir() {
  await fs.mkdir(BACKUP_DIR, { recursive: true });
}

export async function listBackups() {
  await ensureBackupDir();
  const items = await fs.readdir(BACKUP_DIR, { withFileTypes: true });
  const files = items.filter((item) => item.isFile() && item.name.endsWith(".sql"));

  const mapped = await Promise.all(
    files.map(async (file) => {
      const fullPath = path.join(BACKUP_DIR, file.name);
      const stat = await fs.stat(fullPath);
      return {
        name: file.name,
        size: stat.size,
        createdAt: stat.birthtime.toISOString(),
      };
    })
  );

  return mapped.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function createSqlBackup() {
  await ensureBackupDir();
  const sql = await exportSqlDump();
  const name = `backup-${new Date().toISOString().replace(/[:.]/g, "-")}.sql`;
  const filePath = path.join(BACKUP_DIR, name);
  await fs.writeFile(filePath, sql, "utf8");
  return { name, sqlSize: sql.length };
}

export async function restoreSqlBackup(fileName: string) {
  await ensureBackupDir();
  const safeName = path.basename(fileName);
  const filePath = path.join(BACKUP_DIR, safeName);
  const sql = await fs.readFile(filePath, "utf8");
  await dbRaw(sql);
}

export async function restoreSqlPayload(sql: string) {
  await dbRaw(sql);
}

export async function exportTableAsCsv(table: string) {
  return exportTableCsv(table);
}

export async function exportDatabaseSql() {
  return exportSqlDump();
}

export async function getDatabaseTables() {
  return listDbTables();
}

export async function getTableRecords(input: {
  table: string;
  limit: number;
  offset: number;
  search?: string;
}) {
  return getDbRecords(input);
}

export async function updateTableRecord(
  table: string,
  idField: string,
  id: string,
  payload: Record<string, unknown>
) {
  return updateDbRecord(table, idField, id, payload);
}

export async function deleteTableRecord(table: string, idField: string, id: string) {
  return deleteDbRecord(table, idField, id);
}

export async function optimizeDatabaseTable(table: string) {
  return optimizeTable(table);
}
