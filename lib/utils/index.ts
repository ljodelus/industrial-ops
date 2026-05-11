export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', { hour12: false })
}

export function clsx(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
