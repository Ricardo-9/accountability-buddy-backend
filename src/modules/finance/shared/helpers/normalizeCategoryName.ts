export function normalizeCategoryName(name: string) {
  return name.trim().replace(/\s+/g, "").toUpperCase();
}
