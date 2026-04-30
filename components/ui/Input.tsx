import { cn } from '@/lib/cn'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      {...props}
      className={cn(
        'w-full bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm font-mono rounded px-3 py-2 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors',
        className
      )}
    />
  )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      {...props}
      className={cn(
        'bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm font-mono rounded px-3 py-2 focus:outline-none focus:border-zinc-600 transition-colors',
        className
      )}
    >
      {children}
    </select>
  )
}
