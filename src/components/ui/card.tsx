import * as React from "react";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
};

export function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div
      className={
        "rounded-2xl border border-[hsl(var(--border))] bg-white shadow-sm p-4 " +
        className
      }
      {...props}
    >
      {children}
    </div>
  );
}
