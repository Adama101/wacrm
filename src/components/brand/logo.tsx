import { cn } from "@/lib/utils";
import { brand } from "@/lib/brand";

type LogoProps = {
  className?: string;
  /** Show wordmark beside the mark */
  wordmark?: boolean;
  /** Mark size in px */
  size?: number;
  /** Invert to light mark on dark primary buttons */
  onDark?: boolean;
};

/**
 * Meridian mark — meridian arc through a conversation node.
 * Pure SVG so it stays crisp at favicon and hero sizes.
 */
export function LogoMark({
  className,
  size = 28,
  onDark = false,
}: Pick<LogoProps, "className" | "size" | "onDark">) {
  const ink = onDark ? "#ecfeff" : "#0f766e";
  const arc = onDark ? "#5eead4" : "#14b8a6";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <rect width="32" height="32" rx="8" fill={onDark ? "#0f766e" : "#042f2e"} />
      <path
        d="M6 22c4.5-9 15.5-9 20 0"
        stroke={arc}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle cx="16" cy="13" r="3.2" fill={ink} />
      <path
        d="M11 19.5c1.4 1.6 3.1 2.4 5 2.4s3.6-.8 5-2.4"
        stroke={ink}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo({
  className,
  wordmark = true,
  size = 28,
  onDark = false,
}: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark size={size} onDark={onDark} />
      {wordmark ? (
        <span className="font-display text-lg tracking-tight text-white">
          {brand.name}
        </span>
      ) : null}
    </span>
  );
}
