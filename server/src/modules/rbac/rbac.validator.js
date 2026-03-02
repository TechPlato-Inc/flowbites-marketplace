import { z } from 'zod';

export const createRoleSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(50).regex(/^[a-z0-9_]+$/, 'Name must be lowercase alphanumeric with underscores'),
    displayName: z.string().min(2).max(100),
    description: z.string().max(500).optional().default(''),
    permissions: z.array(z.string()).min(1, 'At least one permission is required'),
  }),
});

export const updateRoleSchema = z.object({
  body: z.object({
    displayName: z.string().min(2).max(100).optional(),
    description: z.string().max(500).optional(),
    permissions: z.array(z.string()).optional(),
    name: z.string().min(2).max(50).regex(/^[a-z0-9_]+$/).optional(),
  }),
});

export const assignRoleSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'User ID is required'),
  }),
  body: z.object({
    role: z.string().min(2).max(50).regex(/^[a-z0-9_]+$/, 'Role must be lowercase alphanumeric with underscores'),
  }),
});

export const updatePermissionsSchema = z.object({
  body: z.object({
    permissions: z.array(z.string().min(1)).min(1, 'At least one permission is required'),
  }),
});
