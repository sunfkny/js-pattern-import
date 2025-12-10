/**
 * Normalize a string to a valid JavaScript identifier by replacing special characters with underscores
 * 
 * Replaces the following characters with underscores:
 * - Path separators: `/`, `\`
 * - Special characters: spaces, hyphens (`-`), dots (`.`), `@` symbols
 * 
 * @param str The string to normalize
 * @returns The normalized string with special characters replaced by underscores.
 *          Returns "_" if the input is an empty string.
 */
export function normalizeIdentifier(str: string): string {
  if (str === "") {
    return "_";
  }
  return str.replace(/[/\\\s\-.@]/g, "_");
}

/**
 * Check if a string is a valid JavaScript identifier
 * 
 * A valid identifier must start with a letter, underscore, or dollar sign,
 * and can contain letters, digits, underscores, and dollar signs.
 * 
 * @param str The string to check
 * @returns True if the string is a valid JavaScript identifier, false otherwise
 */
export function isValidIdentifier(str: string): boolean {
  return /^[a-zA-Z_$].*$/.test(str);
}

