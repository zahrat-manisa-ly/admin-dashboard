// ==================== Types ====================

export type PermissionName = string;

export type Permission = PermissionName;

export type CatalogPermission = {
  id: string;
  name: string;
  description?: string | null;
};

export type ParsedPermission = CatalogPermission & {
  resource: string;
  action: string;
};

export type PermissionGroup = {
  resource: string;
  permissions: ParsedPermission[];
};

export type PermissionMatrix = {
  actions: string[];
  resources: PermissionGroup[];
};

// ==================== Action Order ====================

// Define the display order for standard permission actions.
const knownActionOrder = ["read", "create", "update", "delete"] as const;

// ==================== Parse Permission ====================

// Split a permission name such as "users:read" into resource and action.
export function parsePermissionName(name: string): { resource: string; action: string } | null {
  // Find the position of the colon.
  const separator = name.indexOf(":");

  // Reject names with missing, multiple, or incorrectly placed colons.
  if (separator <= 0 || separator !== name.lastIndexOf(":") || separator === name.length - 1) {
    return null;
  }

  // Extract the resource before the colon.
  const resource = name.slice(0, separator);

  // Extract the action after the colon.
  const action = name.slice(separator + 1);

  return {
    resource,
    action,
  };
}

// ==================== Compare Actions ====================

// Sort standard actions first, followed by unknown actions alphabetically.
export function comparePermissionActions(left: string, right: string): number {
  // Get the position of the first action in the standard order.
  const leftIndex = knownActionOrder.indexOf(left as (typeof knownActionOrder)[number]);

  // Get the position of the second action in the standard order.
  const rightIndex = knownActionOrder.indexOf(right as (typeof knownActionOrder)[number]);

  // Sort alphabetically when both actions are unknown.
  if (leftIndex === -1 && rightIndex === -1) {
    return left.localeCompare(right);
  }

  // Place unknown actions after known actions.
  if (leftIndex === -1) {
    return 1;
  }

  // Place known actions before unknown actions.
  if (rightIndex === -1) {
    return -1;
  }

  // Compare the positions of two known actions.
  return leftIndex - rightIndex;
}

// ==================== Group Permissions ====================

// Group permissions by resource and prepare data for the permissions matrix.
export function groupPermissions(items: readonly CatalogPermission[]): PermissionMatrix {
  // Store permissions after splitting their names.
  const parsed: ParsedPermission[] = [];

  // Step 1: Parse all permission names.
  for (const item of items) {
    const parts = parsePermissionName(item.name);

    // Skip permissions with invalid names.
    if (parts === null) {
      continue;
    }

    // Add the resource and action to the original permission.
    parsed.push({
      ...item,
      ...parts,
    });
  }

  // Step 2: Collect unique permission actions.
  const actionsSet = new Set<string>();

  for (const item of parsed) {
    actionsSet.add(item.action);
  }

  // Convert the Set into an array.
  const actions = Array.from(actionsSet);

  // Sort actions using the predefined order.
  actions.sort(comparePermissionActions);

  // Step 3: Group permissions by resource.
  const byResource = new Map<string, ParsedPermission[]>();

  for (const item of parsed) {
    // Get existing permissions for this resource.
    let list = byResource.get(item.resource);

    // Create a new list if the resource does not exist.
    if (list === undefined) {
      list = [];
      byResource.set(item.resource, list);
    }

    // Add the current permission to its resource.
    list.push(item);
  }

  // Step 4: Get all resource names.
  const resourceNames = Array.from(byResource.keys());

  // Sort resource names alphabetically.
  resourceNames.sort((left, right) => {
    return left.localeCompare(right);
  });

  // Step 5: Build the final resource groups.
  const resources: PermissionGroup[] = [];

  for (const resource of resourceNames) {
    // Get all permissions belonging to this resource.
    const permissions = byResource.get(resource) ?? [];

    // Sort permissions by their action names.
    permissions.sort((left, right) => {
      return comparePermissionActions(left.action, right.action);
    });

    // Add the resource and its permissions to the result.
    resources.push({
      resource,
      permissions,
    });
  }

  // Return the actions and grouped resources.
  return {
    actions,
    resources,
  };
}

// ==================== Check Permission ====================

// Check whether the user has a specific permission.
export function hasPermission(permissions: readonly string[], permission: PermissionName): boolean {
  return permissions.includes(permission);
}

// ==================== Route Permissions ====================

// Map dashboard routes to their required API permissions.
export const routePermissions: Record<string, PermissionName> = {
  "/dashboard/finance": "payments:read",
  "/dashboard/bookings": "bookings:read",
  "/dashboard/ticketing": "tickets:read",
  "/dashboard/customers": "clients:read",
  "/dashboard/transactions": "payments:read",
  "/dashboard/refunds": "payments:read",
  "/dashboard/reconciliation": "payments:read",
  "/dashboard/promotions": "coupons:read",
  "/dashboard/notifications": "notifications:read",
  "/dashboard/reports": "statistics:read",
  "/dashboard/analytics-overview": "statistics:read",
  "/dashboard/users": "users:read",
  "/dashboard/roles-permissions": "roles:read",
  "/dashboard/audit-logs": "logs:read",
  "/dashboard/settings": "site_settings:read",
};

// ==================== Get Route Permission ====================

// Find the permission required to access a dashboard route.
export function getRoutePermission(pathname: string): PermissionName | undefined {
  // Get all registered dashboard routes.
  const routes = Object.keys(routePermissions);

  // Sort routes from longest to shortest for more specific matching.
  routes.sort((left, right) => {
    return right.length - left.length;
  });

  // Search for a matching route.
  for (const path of routes) {
    // Return the permission when the path matches exactly.
    if (pathname === path) {
      return routePermissions[path];
    }

    // Return the parent route permission for nested pages.
    if (pathname.startsWith(`${path}/`)) {
      return routePermissions[path];
    }
  }

  // Return undefined when no matching route exists.
  return undefined;
}
