import { LucideIcon } from 'lucide-react'

interface IconProps {
  icon:       LucideIcon
  size?:      number
  className?: string
  label?:     string        // aria-label for accessibility
}

export function Icon({ icon: LucideIconComponent, size = 16, className, label }: IconProps) {
  return (
    <LucideIconComponent
      size={size}
      className={className}
      aria-label={label}
      aria-hidden={!label}
    />
  )
}
