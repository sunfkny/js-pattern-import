import { normalizeIdentifier, isValidIdentifier } from "./stringUtils";

/**
 * File information for generating export names
 */
export interface FileInfo {
  filename: string;
  relativePath: string;
  pathPrefix: string;
  stem: string;
  suffix: string;
}

/**
 * Options for generating export names
 */
export interface ExportNameOptions {
  isRecursive: boolean;
  stemCount: Map<string, number>;
}

/**
 * Generate export name for a file based on its information and options
 * 
 * Rules:
 * 1. Replace spaces, hyphens, dots, and @ with underscores in stem
 * 2. If stem doesn't start with a letter/underscore/dollar, prefix with underscore and append suffix with double underscore
 * 3. If stem is duplicated, append suffix with double underscore
 * 4. If recursive pattern and has path prefix, add path prefix to the name
 * 
 * @param info File information
 * @param options Generation options
 * @returns The generated export name
 */
export function generateExportName(info: FileInfo, options: ExportNameOptions): string {
  const { stem, suffix, pathPrefix } = info;
  const { isRecursive, stemCount } = options;

  // Normalize stem: replace spaces, hyphens, dots, and @ with underscores
  let filenameWithoutSuffix = normalizeIdentifier(stem);

  // Build the full identifier key for duplicate checking
  const fullKey = isRecursive && pathPrefix ? `${pathPrefix}_${filenameWithoutSuffix}` : filenameWithoutSuffix;
  const isDuplicated = (stemCount.get(fullKey) || 0) > 1;
  const isInvalidIdentifier = !isValidIdentifier(filenameWithoutSuffix);

  // If stem is invalid identifier, prefix with underscore and append suffix with double underscore
  if (isInvalidIdentifier) {
    filenameWithoutSuffix = suffix ? `_${filenameWithoutSuffix}__${suffix}` : `_${filenameWithoutSuffix}`;
  } else if (isDuplicated) {
    // If stem is duplicated, append suffix with double underscore
    filenameWithoutSuffix = suffix ? `${filenameWithoutSuffix}__${suffix}` : filenameWithoutSuffix;
  }

  // Add path prefix for recursive patterns
  if (isRecursive && pathPrefix) {
    filenameWithoutSuffix = `${pathPrefix}_${filenameWithoutSuffix}`;
  }

  return filenameWithoutSuffix;
}

/**
 * Build stem count map for duplicate detection
 * 
 * @param fileInfos Array of file information
 * @param isRecursive Whether the pattern is recursive
 * @returns Map of stem keys to their occurrence count
 */
export function buildStemCountMap(fileInfos: FileInfo[], isRecursive: boolean): Map<string, number> {
  const stemCount = new Map<string, number>();
  fileInfos.forEach((info) => {
    // For recursive patterns, count by full identifier (pathPrefix + stem)
    // For non-recursive, count by stem only
    const key = isRecursive && info.pathPrefix ? `${info.pathPrefix}_${info.stem}` : info.stem;
    stemCount.set(key, (stemCount.get(key) || 0) + 1);
  });
  return stemCount;
}

