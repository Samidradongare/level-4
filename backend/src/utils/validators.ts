export function isValidStellarAddress(address: string): boolean {
  if (!address) return false;
  // Stellar G... or C... addresses are 56 chars long alphanumeric uppercase
  return /^[G|C][A-Z2-7]{55}$/.test(address);
}

export function isValidEmail(email: string): boolean {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidNumber(value: any): boolean {
  if (value === undefined || value === null) return false;
  const num = Number(value);
  return !isNaN(num) && isFinite(num) && num >= 0;
}
