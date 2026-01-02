/**
 * Masks a phone number, showing only the first 2 and last 2 digits.
 * Example: "+1234567890" -> "+1******90"
 * @param phone The phone number to mask
 * @returns The masked phone number or the original if it's too short
 */
export const maskPhoneNumber = (phone: string | undefined | null): string => {
    if (!phone || phone.length < 5) return phone || '';

    const firstTwo = phone.slice(0, 2);
    const lastTwo = phone.slice(-2);
    const maskedLength = Math.max(0, phone.length - 4);
    const mask = '*'.repeat(maskedLength);

    return `${firstTwo}${mask}${lastTwo}`;
};
