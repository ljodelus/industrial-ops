import { useForm, UseFormProps } from 'react-hook-form'
import { zodResolver }           from '@hookform/resolvers/zod'
import { z }                    from 'zod'

/**
 * Custom hook wrapping React Hook Form with Zod validation.
 * Always use this instead of bare useForm().
 *
 * @example
 * const form = useZodForm(loginSchema, { defaultValues: { email: '', password: '' } })
 */
export function useZodForm<T extends Record<string, unknown>>(
  schema: z.ZodType<T>,
  options?: Omit<UseFormProps<T>, 'resolver'>
) {
  return useForm<T, any, T>({  // eslint-disable-line @typescript-eslint/no-explicit-any
    // Cast required: @hookform/resolvers v5 + zod v4 generic mismatch
    resolver: zodResolver(schema as z.ZodType as never) as never,
    mode:     'onBlur',       // validate on blur (not on every keystroke)
    ...options,
  })
}


