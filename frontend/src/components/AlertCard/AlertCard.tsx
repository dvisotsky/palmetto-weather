interface Props {
  variant: "error" | "warning";
  message: string;
}

const styles = {
  error: "bg-primary-light border-primary text-primary",
  warning: "bg-amber-50 border-amber-400 text-amber-800",
} as const;

export function AlertCard({ variant, message }: Props) {
  return (
    <div
      role="alert"
      aria-live={variant === "error" ? "assertive" : "polite"}
      className={`border-l-4 rounded px-4 py-3 text-sm font-medium ${styles[variant]}`}
    >
      {message}
    </div>
  );
}
