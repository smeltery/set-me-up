import { cn } from "@/lib/utils";

export const getLogoMarkSVG = (_color: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect width="96" height="96" rx="18" fill="#456449"/><path d="M23 25h13l23 23-23 23H23l23-23zm34 35h16v11H46z" fill="#f7f6ef"/></svg>`;

export const LogoMark = ({
  className,
  ...props
}: React.ComponentProps<"svg">) => (
  <svg
    viewBox="0 0 96 96"
    aria-hidden="true"
    className={cn("size-4", className)}
    {...props}
  >
    <rect width="96" height="96" rx="18" fill="#456449" />
    <path d="M23 25h13l23 23-23 23H23l23-23zm34 35h16v11H46z" fill="#f7f6ef" />
  </svg>
);

export const Wordmark = ({ className }: { className?: string }) => (
  <span
    className={cn(
      "inline-flex items-center gap-2 font-mono text-[0.9rem] font-medium tracking-tight",
      className
    )}
  >
    <LogoMark className="text-primary size-[18px]" />
    set-me-up
  </span>
);
