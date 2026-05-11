import type { SpinnerProps } from '@/types'

const sizeMap: Record<string, string> = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-10 h-10 border-[3px]',
}

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  return (
    <span
      className={`inline-block rounded-full border-scada-border border-t-accent-primary animate-spin ${sizeMap[size]} ${className}`}
    />
  )
}
