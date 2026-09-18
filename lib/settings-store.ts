import { prisma } from "@/lib/prisma";

// Memory & file store fallback
const memorySettingsStore = new Map<string, string>();

function getSettingsFilePath() {
  try {
    const path = require("path");
    return path.join(process.cwd(), ".data", "settings.json");
  } catch (e) {
    return null;
  }
}

// Safely load file store on Node runtimes
try {
  const fs = require("fs");
  const path = require("path");
  const filePath = getSettingsFilePath();
  if (filePath && fs.existsSync && fs.existsSync(filePath)) {
    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw);
    for (const [k, v] of Object.entries(parsed)) {
      if (typeof v === "string") {
        memorySettingsStore.set(k, v);
      }
    }
  }
} catch (e) {
  // Ignore filesystem initialization errors in Edge / serverless
}

function persistToFile() {
  try {
    const fs = require("fs");
    const path = require("path");
    const filePath = getSettingsFilePath();
    if (!filePath || !fs.writeFileSync) return;

    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const obj: Record<string, string> = {};
    memorySettingsStore.forEach((value, key) => {
      obj[key] = value;
    });
    fs.writeFileSync(filePath, JSON.stringify(obj, null, 2), "utf-8");
  } catch (e) {
    // Ignore file write errors on read-only / serverless filesystems
  }
}

export async function getResilientSetting(key: string): Promise<string | null> {
  // 1. Check Prisma DB first if available
  try {
    const dbSetting = await prisma.setting.findUnique({ where: { key } });
    if (dbSetting?.value) {
      memorySettingsStore.set(key, dbSetting.value);
      return dbSetting.value;
    }
  } catch (e) {
    // DB unmigrated or unavailable
  }

  // 2. Check memory/file store
  if (memorySettingsStore.has(key)) {
    return memorySettingsStore.get(key) || null;
  }

  // 3. Check process.env
  return process.env[key] || null;
}

export async function getAllResilientSettings(): Promise<Record<string, string>> {
  const result: Record<string, string> = {};

  // Load file/memory store defaults
  memorySettingsStore.forEach((value, key) => {
    result[key] = value;
  });

  // Try DB
  try {
    const dbSettings = await prisma.setting.findMany();
    for (const s of dbSettings) {
      result[s.key] = s.value;
      memorySettingsStore.set(s.key, s.value);
    }
  } catch (e) {
    // DB unavailable
  }

  return result;
}

export async function setResilientSetting(key: string, value: string): Promise<void> {
  // Always update memory store & file
  memorySettingsStore.set(key, value);
  persistToFile();

  // Try DB update
  try {
    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  } catch (e) {
    // DB unavailable, file/memory store is active
  }
}

export async function setBulkResilientSettings(settingsMap: Record<string, any>): Promise<void> {
  for (const [key, value] of Object.entries(settingsMap)) {
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      const valStr = String(value);
      memorySettingsStore.set(key, valStr);
      try {
        await prisma.setting.upsert({
          where: { key },
          update: { value: valStr },
          create: { key, value: valStr },
        });
      } catch (e) {
        // Ignore DB error
      }
    }
  }
  persistToFile();
}
