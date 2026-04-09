import { HTMLMotionProps, motion } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type GlassButtonVariant =
  | "primary"
  | "secondary"
  | "icon"
  | "danger"
  | "ghost";

export interface GlassButtonProps extends HTMLMotionProps<"button"> {
  variant?: GlassButtonVariant;
}

export const GlassButton = ({
  children,
  className,
  variant = "primary",
  ...props
}: GlassButtonProps) => {
  const baseStyles =
    "relative overflow-hidden transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none";

  const variants: Record<GlassButtonVariant, string> = {
    primary:
      "bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.1)] text-white font-semibold rounded-2xl py-3 px-6 hover:bg-white/20 dark:hover:bg-white/5",
    secondary:
      "bg-transparent backdrop-blur-md border border-squito-green/50 text-squito-green font-semibold rounded-2xl py-3 px-6 hover:bg-squito-green/10",
    icon: "flex h-12 w-12 items-center justify-center rounded-full bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm text-white hover:bg-white/20 dark:hover:bg-white/5",
    danger:
      "bg-red-500/10 backdrop-blur-xl border border-red-500/20 text-red-500 font-semibold rounded-2xl py-3 px-6 hover:bg-red-500/20",
    ghost:
      "bg-transparent text-white font-semibold rounded-2xl py-3 px-6 hover:bg-white/10 backdrop-blur-none",
  };

  return (
    <motion.button
      className={cn(baseStyles, variants[variant], className)}
      {...props}
    >
      {children}
    </motion.button>
  );
};
