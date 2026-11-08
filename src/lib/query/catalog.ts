//--------catalog-cache----//
/** Reference data stays reusable while moving between dashboard pages. */
export const catalogStaleTime = 5 * 60 * 1000;

export const authorizationKeys = {
  roles: ["authorization", "roles"] as const,
  permissions: ["authorization", "permissions"] as const,
};
//-------end-catalog-cache----//
