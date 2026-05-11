import { z } from 'zod'

// ─── Login ───────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(4, 'Password must be at least 4 characters'),
})

export type LoginFormValues = z.infer<typeof loginSchema>

// ─── Recipe Step ─────────────────────────────────────────────────────────────

export const recipeStepSchema = z.object({
  tankNumber:    z.number().int().min(1, 'Tank number must be at least 1'),
  tankName:      z.string().min(1, 'Tank name is required').max(32, 'Max 32 characters'),
  craneNumber:   z.number().int().min(1, 'Crane number must be at least 1'),
  minTime:       z.number().min(0, 'Min time cannot be negative'),
  preferredTime: z.number().min(0, 'Preferred time cannot be negative'),
  maxTime:       z.number().min(0, 'Max time cannot be negative'),
  notes:         z.string().max(200, 'Max 200 characters').optional(),
}).refine(
  data => data.minTime <= data.preferredTime,
  { message: 'Min time must be ≤ preferred time', path: ['minTime'] }
).refine(
  data => data.preferredTime <= data.maxTime,
  { message: 'Preferred time must be ≤ max time', path: ['preferredTime'] }
)

export type RecipeStepValues = z.infer<typeof recipeStepSchema>

// ─── Recipe ──────────────────────────────────────────────────────────────────

export const recipeSchema = z.object({
  name: z
    .string()
    .min(1, 'Recipe name is required')
    .max(64, 'Max 64 characters')
    .regex(/^[A-Z0-9\s\-_]+$/, 'Name must be uppercase alphanumeric'),
  steps: z
    .array(recipeStepSchema)
    .min(2, 'A recipe must have at least 2 steps')
    .max(20, 'A recipe cannot exceed 20 steps'),
})

export type RecipeFormValues = z.infer<typeof recipeSchema>

// ─── Recipe Form (base info — steps are managed separately) ───────────────────

export const recipeFormBaseSchema = z.object({
  name: z
    .string()
    .min(1, 'Recipe name is required')
    .max(64, 'Max 64 characters')
    .regex(/^[A-Z0-9\s\-_]+$/, 'Uppercase alphanumeric only (A-Z, 0-9, spaces, - _)'),
  line: z.enum(['LINE-1', 'LINE-2'] as const, 'Please select a production line'),
  description:  z.string().max(200, 'Max 200 characters').optional(),
  versionNote:  z.string().max(200, 'Max 200 characters').optional(),
})

export type RecipeFormBaseValues = z.infer<typeof recipeFormBaseSchema>

// ─── Job ─────────────────────────────────────────────────────────────────────

export const jobSchema = z.object({
  recipeId: z
    .string()
    .min(1, 'Please select a recipe'),
  priority: z
    .number()
    .int()
    .min(1, 'Priority must be at least 1')
    .max(100, 'Priority cannot exceed 100'),
  line: z.enum(['LINE-1', 'LINE-2'], 'Please select a production line'),
  notes: z
    .string()
    .max(200, 'Max 200 characters')
    .optional(),
})

export type JobFormValues = z.infer<typeof jobSchema>

// ─── User (Admin) ─────────────────────────────────────────────────────────────

export const userSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(64, 'Max 64 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  role: z.enum(['operator', 'supervisor', 'engineer', 'admin'] as const, 'Please select a valid role'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(32, 'Max 32 characters'),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
}).refine(
  data => data.password === data.confirmPassword,
  { message: 'Passwords do not match', path: ['confirmPassword'] }
)

export type UserFormValues = z.infer<typeof userSchema>

// ─── Edit User ────────────────────────────────────────────────────────────────

export const editUserSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(64, 'Max 64 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  role: z.enum(['operator', 'supervisor', 'engineer', 'admin'] as const, 'Please select a valid role'),
})

export type EditUserFormValues = z.infer<typeof editUserSchema>

// ─── Reset Password ───────────────────────────────────────────────────────────

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(32, 'Max 32 characters'),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
}).refine(
  data => data.password === data.confirmPassword,
  { message: 'Passwords do not match', path: ['confirmPassword'] }
)

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

// ─── Recipe Import File ───────────────────────────────────────────────────────

const importStepSchema = z.object({
  tankNumber:    z.number({ error: 'tankNumber: Expected number, received string' }),
  tankName:      z.string().min(1, 'tankName is required'),
  craneNumber:   z.number({ error: 'craneNumber: Expected number, received string' }),
  minTime:       z.number({ error: 'minTime: Expected number, received string' }),
  preferredTime: z.number({ error: 'preferredTime: Expected number, received string' }),
  maxTime:       z.number({ error: 'maxTime: Expected number, received string' }),
  notes:         z.string().optional(),
})

const importRecipeSchema = z.object({
  name:      z.string().min(1, 'name is required'),
  version:   z.number({ error: 'version must be a number' }).optional(),
  line:      z.string().optional(),
  steps:     z.array(importStepSchema).min(2, 'steps must have at least 2 items'),
  updatedBy: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

export const importedRecipeFileSchema = z.object({
  exportedAt: z.string(),
  exportedBy: z.string(),
  version:    z.string(),
  recipes:    z.array(importRecipeSchema),
})

export type ImportedRecipeFileValues = z.infer<typeof importedRecipeFileSchema>

// ─── Alarm Filter ─────────────────────────────────────────────────────────────

export const alarmFilterSchema = z.object({
  search:       z.string().optional(),
  severity:     z.enum(['critical', 'high', 'medium', 'low', 'info', '']).optional(),
  acknowledged: z.enum(['all', 'yes', 'no']).optional(),
})

export type AlarmFilterValues = z.infer<typeof alarmFilterSchema>
