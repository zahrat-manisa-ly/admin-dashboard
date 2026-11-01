import { z } from "zod";

const permissionSchema = z.string();

export const userStatusSchema = z.enum(["active", "invited", "suspended"]);
export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  roleId: z.string(),
  status: userStatusSchema,
  lastActive: z.string(),
});
export const userInputSchema = userSchema.pick({ name: true, email: true, roleId: true }).extend({
  name: z.string().trim().min(1).max(120),
  email: z.email().trim().toLowerCase(),
  roleId: z.string().min(1),
});
export const userUpdateSchema = userInputSchema.partial().extend({ status: userStatusSchema.optional() });
export const roleSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  permissions: z.array(permissionSchema),
  locked: z.boolean().optional(),
  memberCount: z.number().int().nonnegative().default(0),
});
export const roleInputSchema = roleSchema.pick({ name: true, description: true, permissions: true }).extend({
  name: z.string().trim().min(1).max(80),
  description: z.string().trim().max(300),
});
export const currentUserSchema = userSchema.extend({
  roleName: z.string(),
  permissions: z.array(permissionSchema),
});
export const loginResponseSchema = z.object({
  access_token: z.string().min(1),
  token_type: z.literal("bearer"),
  user: currentUserSchema,
});
export const usersPageSchema = z.object({
  items: z.array(userSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
});
export const userStatsSchema = z.object({
  total: z.number().int().nonnegative(),
  active: z.number().int().nonnegative(),
  invited: z.number().int().nonnegative(),
});
export const usersParamsSchema = z.object({
  search: z.string().max(200).default(""),
  status: z.enum(["all", "active", "invited", "suspended"]).default("all"),
  roleId: z.string().default("all"),
  sort: z.enum(["name", "-name", "lastActive"]).default("name"),
  page: z.coerce.number().int().min(1).max(100000).catch(1).default(1),
  pageSize: z.coerce
    .number()
    .refine((value) => [5, 10, 25, 50].includes(value))
    .catch(5)
    .default(5),
});

export type TeamUser = z.infer<typeof userSchema>;
export type TeamRole = z.infer<typeof roleSchema>;
export type CurrentUser = z.infer<typeof currentUserSchema>;
export type UserInput = z.infer<typeof userInputSchema>;
export type UserUpdate = z.infer<typeof userUpdateSchema>;
export type RoleInput = z.infer<typeof roleInputSchema>;
export type UsersParams = z.infer<typeof usersParamsSchema>;
