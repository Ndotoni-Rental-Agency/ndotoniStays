/**
 * Converts a string to title case (first letter of each word capitalized)
 */
export function toTitleCase(str: string | null | undefined): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
