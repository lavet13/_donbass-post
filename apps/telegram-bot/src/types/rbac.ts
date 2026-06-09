export const Permissions = {
  USERS_MANAGE: "users:manage",
  BOT_VIEW_STATUS: "bot:view-status",
} as const;

// Derive the union from the values
export type Permission = (typeof Permissions)[keyof typeof Permissions];

export const Roles = {
  ROOT: "root",
  ADMIN: "admin",
  MANAGER: "manager",
} as const;

export type Role = (typeof Roles)[keyof typeof Roles];

// A sentinel meaning "all permissions". Kept separate from real slugs
// so the compiler can tell "grant everything" apart from a specific grant.
export const WILDCARD = "*" as const;
export type Wildcard = typeof WILDCARD;
