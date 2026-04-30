import { cn } from '@/lib/cn'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
}

export function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        'inline-flex items-center justify-center font-mono font-semibold rounded transition-colors focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed',
        {
          'bg-zinc-50 text-zinc-950 hover:bg-zinc-200': variant === 'primary',
          'bg-zinc-800 text-zinc-200 hover:bg-zinc-700 border border-zinc-700': variant === 'secondary',
          'bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800': variant === 'ghost',
          'bg-rose-600 text-white hover:bg-rose-500': variant === 'danger',
          'text-xs px-3 py-1.5': size === 'sm',
          'text-sm px-4 py-2': size === 'md',
        },
        className
      )}
    >
      {children}
    </button>
  )
}
