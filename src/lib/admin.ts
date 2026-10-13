export function hasAdminGroup(groups?: string[]) {
  return Array.isArray(groups) && (groups.includes("geek") || groups.includes("vpmatos"));
}
