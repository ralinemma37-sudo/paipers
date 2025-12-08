import * as React from "react";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  className?: string;
};

type CardContentProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  className?: string;
};

export function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div
      className={
        "rounded-2xl bg-white shadow-sm border border-pink-100 " + className
      }
      {...props}
    >
      {children}
    </div>
  );
}

export function CardContent({
  children,
  className = "",
  ...props
}: CardContentProps) {
  return (
    <div className={"p-4 " + className} {...props}>
      {children}
    </div>
  );
}
