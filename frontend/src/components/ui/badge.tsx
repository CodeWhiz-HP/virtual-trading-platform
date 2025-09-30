import * as React from 'react'

type Variant = 'default' | 'secondary' | 'outline'

export function Badge({ className = '', variant = 'default', ...props }: React.HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  const styles: Record<Variant, string> = {
    default: 'bg-emerald-600 text-white',
    secondary: 'bg-white/10 text-white',
    outline: 'border border-current text-emerald-400',
  }
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[variant]} ${className}`} {...props} />
}
