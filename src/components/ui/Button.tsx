import React from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  children, 
  ...props 
}: ButtonProps) {
  
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-focus-ring"
  
  const variants = {
    primary: "bg-button text-surface hover:bg-button-hover active:bg-button-active",
    secondary: "bg-surface border border-border text-text hover:bg-surface-hover",
    danger: "bg-error text-white hover:opacity-90",
    outline: "border border-brand text-brand hover:bg-brand/10",
    ghost: "text-text-secondary hover:text-brand hover:bg-brand/5"
  }
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm gap-1",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2"
  }
  
  const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`
  
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}
