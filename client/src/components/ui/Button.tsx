import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger";

const styles: Record<Variant, string> = {
  primary: "bg-brand-500 text-white hover:bg-brand-600",
  secondary: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50",
  danger: "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`px-3.5 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${styles[variant]} ${className}`}
      {...props}
    />
  );
}
