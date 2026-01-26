/**
 * Sanitizes a string input to prevent XSS attacks.
 * It encodes special characters into their HTML entity equivalents.
 * 
 * @param input - The raw string input to sanitize.
 * @returns The sanitized string.
 */
export function sanitizeInput(input: string): string {
    if (!input) return "";
    return input
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * Validates if a string contains any potential script tags or malicious content.
 * 
 * @param input - The string to check.
 * @returns True if safe, false if potential threat detected.
 */
export function isInputSafe(input: string): boolean {
    const dangerousPatterns = [
        /<script\b[^>]*>([\s\S]*?)<\/script>/gim,
        /javascript:/gim,
        /vbscript:/gim,
        /onload=/gim,
        /onerror=/gim,
        /onclick=/gim,
    ];

    return !dangerousPatterns.some(pattern => pattern.test(input));
}
