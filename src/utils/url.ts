/**
 * Utility functions for URL manipulation and pattern matching
 */

/**
 * Escapes special characters in a string for use in a regular expression
 */
export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Creates a wildcard pattern from a URL that matches all pages under the same path
 * For example, converts https://example.com/path/page to https://example\.com/path/?.*
 */
export function createWildcardPattern(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/");

    // Remove the last part of the path if it's not empty
    if (pathParts.length > 1 && pathParts[pathParts.length - 1] !== "") {
      pathParts.pop();
    }

    // Create a path that can match with or without trailing slash
    const basePath = pathParts.join("/");

    // Use escaped hostname and make trailing slash optional with /?
    const escapedOrigin = escapeRegExp(urlObj.origin);
    // The pattern matches: basePath + optional trailing slash + any characters
    return `${escapedOrigin}${basePath}/?.*`;
  } catch (e) {
    console.error("Error creating wildcard pattern:", e);
    return escapeRegExp(url);
  }
}

/**
 * Extracts domain from a URL
 */
export function getDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return url;
  }
}
