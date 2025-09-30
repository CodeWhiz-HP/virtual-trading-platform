import * as React from 'react'

type Variant = 'default' | 'outline' | 'ghost' | 'secondary'
type Size = 'default' | 'icon'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
}

const base = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/40 disabled:opacity-50 disabled:pointer-events-none'
const variants: Record<Variant, string> = {
  default: 'bg-emerald-600 text-white hover:bg-emerald-700',
  outline: 'border border-white/20 text-white hover:bg-white/10',
  ghost: 'bg-transparent text-white/80 hover:text-white hover:bg-white/10',
  secondary: 'bg-white/10 text-white hover:bg-white/20',
}
const sizes: Record<Size, string> = {
  default: 'h-10 px-4 py-2',
  icon: 'h-10 w-10 p-0',
}

export const Button = React.forwardRef<HTMLButtonElement, Props>(
  ({ className = '', variant = 'default', size = 'default', ...props }, ref) => (
    <button ref={ref} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props} />
  )
)
Button.displayName = 'Button'
