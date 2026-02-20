import { z } from 'zod';

export const createTemplateSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200),
    description: z.string().min(1).max(5000),
    platform: z.enum(['webflow', 'framer', 'wix']),
    category: z.string().min(1),
    tags: z.array(z.string()).optional(),
    price: z.coerce.number().min(0),
    licenseType: z.enum(['personal', 'commercial', 'extended']).optional(),
    deliveryType: z.enum(['clone_link', 'remix_link', 'file_download']).optional(),
    deliveryUrl: z.string().url().optional().or(z.literal('')),
    demoUrl: z.string().url().optional().or(z.literal('')),
    metaDescription: z.string().max(160).optional()
  })
});

export const updateTemplateSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().min(1).max(5000).optional(),
    platform: z.enum(['webflow', 'framer', 'wix']).optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    price: z.coerce.number().min(0).optional(),
    licenseType: z.enum(['personal', 'commercial', 'extended']).optional(),
    deliveryType: z.enum(['clone_link', 'remix_link', 'file_download']).optional(),
    deliveryUrl: z.string().url().optional().or(z.literal('')),
    demoUrl: z.string().url().optional().or(z.literal('')),
    status: z.enum(['draft', 'pending']).optional()
  })
});
