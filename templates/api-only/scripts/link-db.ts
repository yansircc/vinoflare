#!/usr/bin/env bun
import path from "node:path";
import fs from "node:fs";

const D1_DIR = ".wrangler/state/v3/d1/miniflare-D1DatabaseObject";
const LINK_PATH = "./db.sqlite";

// 查找最新的 SQLite 文件
const findLatestDb = () => {
  const dbDir = path.resolve(D1_DIR);
  
  if (!fs.existsSync(dbDir)) {
    console.error("D1 directory not found. Run 'bun dev' first to create the database.");
    process.exit(1);
  }

  const files = fs.readdirSync(dbDir)
    .filter(file => file.endsWith('.sqlite'))
    .map(file => ({
      name: file,
      path: path.join(dbDir, file),
      mtime: fs.statSync(path.join(dbDir, file)).mtime
    }))
    .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

  if (files.length === 0) {
    console.error("No SQLite database found.");
    process.exit(1);
  }

  return files[0].path;
};

// 创建符号链接
const dbPath = findLatestDb();
const relativePath = path.relative(process.cwd(), dbPath);

// 删除旧链接（如果存在）
try {
  if (fs.existsSync(LINK_PATH)) {
    const stats = fs.lstatSync(LINK_PATH);
    if (stats.isSymbolicLink()) {
      const existingTarget = fs.readlinkSync(LINK_PATH);
      if (existingTarget !== relativePath) {
        console.log(`🔄 Updating symlink (was pointing to ${existingTarget})`);
        fs.unlinkSync(LINK_PATH);
      } else {
        console.log(`✅ Symlink already correct: ${LINK_PATH} -> ${relativePath}`);
        process.exit(0);
      }
    } else {
      console.warn("⚠️  Removing non-symlink file at db.sqlite");
      fs.unlinkSync(LINK_PATH);
    }
  }
} catch (error) {
  console.warn("⚠️  Could not process old file:", error);
  // 尝试强制删除
  try {
    fs.unlinkSync(LINK_PATH);
  } catch {}
}

// 创建新链接
try {
  fs.symlinkSync(relativePath, LINK_PATH);
  console.log(`✅ Created symlink: ${LINK_PATH} -> ${relativePath}`);
} catch (error: any) {
  if (error.code === 'EEXIST') {
    // 链接已存在，可能是同一个目标
    try {
      const existingTarget = fs.readlinkSync(LINK_PATH);
      if (existingTarget === relativePath) {
        console.log(`✅ Symlink already exists: ${LINK_PATH} -> ${relativePath}`);
      } else {
        console.error(`❌ Symlink exists but points to different target: ${existingTarget}`);
        console.log(`   Expected: ${relativePath}`);
        process.exit(1);
      }
    } catch {
      console.error("❌ File exists but is not a symlink");
      process.exit(1);
    }
  } else {
    console.error("❌ Failed to create symlink:", error.message);
    console.log("\n💡 Alternative: Use the direct path:");
    console.log(`   LOCAL_DB_PATH="${dbPath}" drizzle-kit studio`);
    process.exit(1);
  }
}