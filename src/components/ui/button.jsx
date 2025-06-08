import React from "react";

/**
 * Simple button component used across the app. It just forwards all props to the
 * underlying <button> element and merges the provided className with a few
 * defaults so Tailwind styling works out of the box.
 */
export const Button = React.forwardRef(function Button(
  { className = "", ...props },
  ref
) {
  const base =
    "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium";
  return (
    <button ref={ref} className={`${base} ${className}`} {...props} />
  );
});
