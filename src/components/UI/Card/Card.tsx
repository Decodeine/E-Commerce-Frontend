import React from "react";

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "outlined" | "glass";
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  hover?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

const variantClasses: Record<NonNullable<CardProps["variant"]>, string> = {
  default: "bg-white border border-slate-200 shadow-sm",
  elevated: "bg-white border border-slate-200 shadow-md",
  outlined: "bg-transparent border border-slate-200",
  glass: "bg-white border border-slate-200 shadow-sm",
};

const paddingClasses: Record<NonNullable<CardProps["padding"]>, string> = {
  none: "p-0",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
  xl: "p-8",
};

const Card: React.FC<CardProps> = ({
  children,
  className = "",
  variant = "default",
  padding = "md",
  hover = false,
  clickable = false,
  onClick,
  style,
  ...props
}) => {
  const baseClasses =
    "relative w-full overflow-hidden rounded-xl text-left text-slate-900 transition-shadow";

  const classes = [
    baseClasses,
    variantClasses[variant],
    paddingClasses[padding],
    hover ? "hover:shadow-lg" : "",
    clickable ? "cursor-pointer hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const Component: "div" | "button" = clickable ? "button" : "div";

  return (
    <Component
      className={classes}
      onClick={onClick}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Card;
