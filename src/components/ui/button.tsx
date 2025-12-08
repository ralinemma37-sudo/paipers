import * as React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
};

export function Button({ children, className = "", ...props }: ButtonProps) {
  return (
    <button
      className={
        "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium " +
        "bg-[hsl(var(--primary))] text-white shadow-sm transition-transform active:scale-95 disabled:opacity-60 " +
        className
      }
      {...props}
    >
      {children}
    </button>
  );
}
