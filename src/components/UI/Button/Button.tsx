import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "warning";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: IconDefinition | React.ReactElement;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  as?: React.ElementType;
  to?: string;
  children: React.ReactNode;
}

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-brand text-white hover:bg-brand-light shadow-card hover:shadow-card-hover border border-brand",
  secondary:
    "bg-slate-900 text-white hover:bg-slate-800 border border-slate-900/80",
  outline:
    "bg-transparent text-brand border border-brand hover:bg-brand hover:text-white",
  ghost:
    "bg-transparent text-slate-700 hover:bg-slate-100 border border-transparent",
  danger:
    "bg-red-600 text-white border border-red-600 hover:bg-red-500",
  warning:
    "bg-amber-500 text-white border border-amber-500 hover:bg-amber-400",
};

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-sm md:text-base",
};

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  iconPosition = "left",
  fullWidth = false,
  as: Component = "button",
  to,
  className = "",
  children,
  disabled,
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed";

  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? "w-full" : "",
    loading ? "cursor-wait" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const renderIcon = () => {
    if (loading) {
      return (
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-transparent border-t-current" />
      );
    }

    if (icon) {
      if (typeof icon === "object" && icon && "iconName" in (icon as any)) {
        return <FontAwesomeIcon icon={icon as IconDefinition} className="shrink-0" />;
      }

      return <span className="shrink-0">{icon as React.ReactElement}</span>;
    }

    return null;
  };

  const content = (
    <>
      {iconPosition === "left" && renderIcon()}
      <span className="inline-flex items-center gap-1">{children}</span>
      {iconPosition === "right" && renderIcon()}
    </>
  );

  if (Component === "button") {
    return (
      <button className={classes} disabled={disabled || loading} {...props}>
        {content}
      </button>
    );
  }

  return (
    <Component className={classes} to={to} {...props}>
      {content}
    </Component>
  );
};

export default Button;
