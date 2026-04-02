// Roles available in the system
const ROLES = {
  ADMIN: "admin",
  ANALYST: "analyst",
  VIEWER: "viewer",
};

// What each role is allowed to do
const PERMISSIONS = {
  [ROLES.ADMIN]: [
    "user:create",
    "user:read",
    "user:update",
    "user:delete",
    "record:create",
    "record:read",
    "record:update",
    "record:delete",
    "summary:read",
  ],
  [ROLES.ANALYST]: [
    "record:read",
    "summary:read",
  ],
  [ROLES.VIEWER]: [
    "summary:read",
  ],
};

const RECORD_TYPES = {
  INCOME: "income",
  EXPENSE: "expense",
};

const CATEGORIES = [
  "salary",
  "freelance",
  "investment",
  "rent",
  "utilities",
  "groceries",
  "transportation",
  "entertainment",
  "healthcare",
  "education",
  "other",
];

module.exports = { ROLES, PERMISSIONS, RECORD_TYPES, CATEGORIES };
