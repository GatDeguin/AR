import clsx from "clsx";

export function Button({ className = '', variant = 'default', size = 'default', ...props }) {
  const base = 'rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variants = {
    default: 'bg-gray-200 text-black hover:bg-gray-300',
    ghost: 'bg-transparent hover:bg-gray-200',
  };
  const sizes = {
    default: 'px-3 py-2 text-sm',
    sm: 'px-2 py-1 text-sm',
  };
  return (
    <button className={clsx(base, variants[variant], sizes[size], className)} {...props} />
  );
}
