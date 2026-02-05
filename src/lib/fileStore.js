import fs from "fs/promises";
import path from "path";
import { createLogger } from "@/lib/logger.node";

const logger = createLogger("fileStore");

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".pdf"];
const ALLOWED_FOLDERS = ["visitors", "visitors/photos", "visitors/documents", "patrols", "patrols/pictures"];

export class FileValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "FileValidationError";
    this.statusCode = 400;
  }
}

function isPathContained(requestedPath, basePath) {
  const resolvedPath = path.resolve(requestedPath);
  const resolvedBase = path.resolve(basePath);
  return resolvedPath.startsWith(resolvedBase);
}

function validateFile(file) {

  if (file.size > MAX_FILE_SIZE) {
    throw new FileValidationError(
      `File size exceeds maximum limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`
    );
  }

  if (file.type && !ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new FileValidationError(
      `File type '${file.type}' is not allowed. Allowed types: ${ALLOWED_IMAGE_TYPES.join(", ")}`
    );
  }

  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    throw new FileValidationError(
      `File extension '${ext}' is not allowed. Allowed extensions: ${ALLOWED_EXTENSIONS.join(", ")}`
    );
  }

  return true;
}

function sanitizeFileName(fileName) {

  const baseName = path.basename(fileName);

  return baseName.replace(/[^a-zA-Z0-9.-]/g, "_");
}

export async function saveUploadedFile(file, typeFolder, baseName) {

  validateFile(file);

  const cleanTypeFolder = typeFolder.replace(/\.\./g, "").replace(/\/+/g, "/");
  const publicDir = path.join(process.cwd(), "public");
  const folder = path.join(publicDir, cleanTypeFolder, baseName.replace(/\s/g, ""));

  if (!isPathContained(folder, publicDir)) {
    throw new FileValidationError("Invalid upload path: path traversal detected");
  }

  await fs.mkdir(folder, { recursive: true });

  const sanitizedFileName = sanitizeFileName(file.name);
  const ext = path.extname(sanitizedFileName);
  const filePath = path.join(folder, `${baseName.replace(/\s/g, "")}${ext}`);

  if (!isPathContained(filePath, folder)) {
    throw new FileValidationError("Invalid file path: path traversal detected");
  }

  const data = Buffer.from(await file.arrayBuffer());

  if (data.length > MAX_FILE_SIZE) {
    throw new FileValidationError(
      `File size exceeds maximum limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`
    );
  }

  await fs.writeFile(filePath, data);

  logger.info({
    message: "File saved successfully",
    fileName: sanitizedFileName,
    size: data.length,
    path: filePath,
  });

  return path
    .relative(publicDir, filePath)
    .replace(/\\/g, "/");
}

export async function deleteFile(publicPath) {
  try {
    if (!publicPath) return;

    if (publicPath.includes("..") || publicPath.startsWith("/")) {
      throw new FileValidationError("Invalid path: path traversal detected");
    }

    const publicDir = path.join(process.cwd(), "public");
    const fullPath = path.join(publicDir, publicPath);

    if (!isPathContained(fullPath, publicDir)) {
      throw new FileValidationError("Invalid path: path traversal detected");
    }

    await fs.unlink(fullPath);

    const folder = path.dirname(fullPath);
    await deleteEmptyDirsRecursively(folder, publicDir);
  } catch (err) {
    logger.error({ message: "deleteFile error", error: err.message });
  }
}

async function deleteEmptyDirsRecursively(dirPath, baseDir) {
  try {
    const files = await fs.readdir(dirPath);
    if (files.length > 0) return;

    if (!isPathContained(dirPath, baseDir)) {
      return;
    }

    await fs.rmdir(dirPath);
    const parent = path.dirname(dirPath);

    if (parent === baseDir || !isPathContained(parent, baseDir)) return;

    await deleteEmptyDirsRecursively(parent, baseDir);
  } catch (_) {}
}
