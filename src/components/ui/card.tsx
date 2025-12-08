import React from "react";

export function Card({ children, className = "" }) {
  return (
    <div
      className={
        "rounded-2xl bg-white shadow-sm border border-pink-100 " + className
      }
    >
      {children}
    </div>
  );
}

export function CardContent({ children, className = "" }) {
  return <div className={"p-4 " + className}>{children}</div>;
}
