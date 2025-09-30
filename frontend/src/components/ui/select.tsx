import * as React from 'react'

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className = '', children, ...props }, ref) => (
    <select
      ref={ref}
      className={`w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/40 text-white border-white/20 ${className}`}
      {...props}
    >
      {children}
    </select>
  )
)
Select.displayName = 'Select'
