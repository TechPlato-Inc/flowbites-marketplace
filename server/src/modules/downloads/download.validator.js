import { z } from 'zod';

const objectId = z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid ObjectId');

export const downloadRequestSchema = z.object({
  body: z.object({
    templateId: objectId,
  }),
});

export const downloadTokenParamSchema = z.object({
  params: z.object({
    token: z.string().uuid('Invalid download token format'),
  }),
});
