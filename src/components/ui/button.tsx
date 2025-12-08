import React from "react";

export function Button({ children, className = "", ...props }) {
  return (
    <button
      className={
        "px-4 py-2 rounded-xl font-medium bg-pink-500 text-white active:scale-95 transition " +
        className
      }
      {...props}
    >
      {children}
    </button>
  );
}
