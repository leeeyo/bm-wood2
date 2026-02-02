import { promises as fs } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { MediaType } from "@/types/models.types";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const IMAGES_DIR = path.join(UPLOAD_DIR, "images");
const DOCUMENTS_DIR = path.join(UPLOAD_DIR, "documents");

// Allowed MIME types
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_DOCUMENT_TYPES = ["application/pdf"];

// Max file sizes (in bytes)
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_DOCUMENT_SIZE = 25 * 1024 * 1024; // 25MB

export interface UploadResult {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  url: string;
  type: MediaType;
}

export interface UploadError {
  message: string;
  code: "INVALID_TYPE" | "FILE_TOO_LARGE" | "UPLOAD_FAILED";
}

/**
 * Ensure upload directories exist
 */
export async function ensureUploadDirectories(): Promise<void> {
  await fs.mkdir(IMAGES_DIR, { recursive: true });
  await fs.mkdir(DOCUMENTS_DIR, { recursive: true });
}

/**
 * Get media type from MIME type
 */
export function getMediaType(mimeType: string): MediaType | null {
  if (ALLOWED_IMAGE_TYPES.includes(mimeType)) {
    return MediaType.IMAGE;
  }
  if (ALLOWED_DOCUMENT_TYPES.includes(mimeType)) {
    return MediaType.DOCUMENT;
  }
  return null;
}

/**
 * Validate file before upload
 */
export function validateFile(
  mimeType: string,
  size: number
): { valid: true } | { valid: false; error: UploadError } {
  const mediaType = getMediaType(mimeType);

  if (!mediaType) {
    return {
      valid: false,
      error: {
        message: `Invalid file type. Allowed types: ${[...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES].join(", ")}`,
        code: "INVALID_TYPE",
      },
    };
  }

  const maxSize = mediaType === MediaType.IMAGE ? MAX_IMAGE_SIZE : MAX_DOCUMENT_SIZE;

  if (size > maxSize) {
    const maxSizeMB = maxSize / (1024 * 1024);
    return {
      valid: false,
      error: {
        message: `File too large. Maximum size for ${mediaType}s is ${maxSizeMB}MB`,
        code: "FILE_TOO_LARGE",
      },
    };
  }

  return { valid: true };
}

/**
 * Generate unique filename
 */
export function generateFilename(originalName: string): string {
  const ext = path.extname(originalName);
  const timestamp = Date.now();
  const uuid = uuidv4();
  return `${timestamp}-${uuid}${ext}`;
}

/**
 * Get upload directory based on media type
 */
export function getUploadDirectory(mediaType: MediaType): string {
  return mediaType === MediaType.IMAGE ? IMAGES_DIR : DOCUMENTS_DIR;
}

/**
 * Get public URL for uploaded file
 */
export function getPublicUrl(mediaType: MediaType, filename: string): string {
  const subdir = mediaType === MediaType.IMAGE ? "images" : "documents";
  return `/uploads/${subdir}/${filename}`;
}

/**
 * Save file to local storage
 */
export async function saveFile(
  buffer: Buffer,
  originalName: string,
  mimeType: string
): Promise<UploadResult | UploadError> {
  try {
    // Validate file
    const validation = validateFile(mimeType, buffer.length);
    if (!validation.valid) {
      return validation.error;
    }

    // Ensure directories exist
    await ensureUploadDirectories();

    // Get media type and directory
    const mediaType = getMediaType(mimeType);
    if (!mediaType) {
      return {
        message: "Invalid file type",
        code: "INVALID_TYPE",
      };
    }

    // Generate filename and paths
    const filename = generateFilename(originalName);
    const directory = getUploadDirectory(mediaType);
    const filePath = path.join(directory, filename);
    const url = getPublicUrl(mediaType, filename);

    // Write file
    await fs.writeFile(filePath, buffer);

    return {
      filename,
      originalName,
      mimeType,
      size: buffer.length,
      path: filePath,
      url,
      type: mediaType,
    };
  } catch (error) {
    console.error("File upload error:", error);
    return {
      message: "Failed to save file",
      code: "UPLOAD_FAILED",
    };
  }
}

/**
 * Delete file from local storage
 */
export async function deleteFile(filePath: string): Promise<boolean> {
  try {
    await fs.unlink(filePath);
    return true;
  } catch (error) {
    console.error("File deletion error:", error);
    return false;
  }
}

/**
 * Check if a result is an error
 */
export function isUploadError(result: UploadResult | UploadError): result is UploadError {
  return "code" in result;
}
