import * as path from "path";
import { FileInfo } from "./exportNameGenerator";
import { normalizeIdentifier } from "./stringUtils";

/**
 * Options for collecting file information
 */
export interface FileInfoCollectorOptions {
  currentFileDir: string;
  isRecursive: boolean;
}

/**
 * File URI interface for abstraction (allows testing without vscode.Uri)
 */
export interface FileUri {
  fsPath: string;
}

/**
 * Collect file information from a list of file URIs
 * 
 * Rules:
 * 1. Filter out files without filenames
 * 2. Filter out files in parent directories (relative path starts with ../)
 * 3. Extract path prefix for recursive patterns (only subdirectories)
 * 4. Parse filename into stem and suffix
 * 
 * @param files Array of file URIs
 * @param options Collection options
 * @returns Array of file information
 */
export function collectFileInfos(files: FileUri[], options: FileInfoCollectorOptions): FileInfo[] {
  const { currentFileDir, isRecursive } = options;
  const fileInfos: FileInfo[] = [];

  files.forEach((file) => {
    const filePath = file.fsPath;
    const filename = path.basename(filePath);
    if (!filename) {
      return;
    }

    // Calculate relative path from current file directory
    const relativePath = path.relative(currentFileDir, filePath).replace(/\\/g, "/");

    // Filter out files in parent directories (relative path starts with ../)
    if (relativePath.startsWith("../") || relativePath.startsWith("..\\")) {
      return;
    }

    // Extract path prefix (directory part) for recursive patterns
    // Only include subdirectories, not parent directories
    let pathPrefix = "";
    if (isRecursive && relativePath !== filename) {
      const dirPath = path.dirname(relativePath);
      // Only use subdirectory paths (not "." or paths with "..")
      if (dirPath !== "." && !dirPath.includes("..")) {
        // Convert path to valid identifier
        pathPrefix = normalizeIdentifier(dirPath);
      }
    }

    const parts = filename.split(".");
    // If there's only one part (no extension), use it as stem and empty suffix
    if (parts.length === 1) {
      fileInfos.push({ filename, relativePath, pathPrefix, stem: parts[0], suffix: "" });
      return;
    }
    // Otherwise, last part is extension, rest is stem
    const suffix = parts.pop() || "";
    const stem = parts.join(".") || "";
    fileInfos.push({ filename, relativePath, pathPrefix, stem, suffix });
  });

  return fileInfos;
}

