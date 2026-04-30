import { SpinnerIcon } from "../icons/SpinnerIcon";

interface Props {
  label?: string;
}

export function Loading({ label = "Loading…" }: Props) {
  return (
    <div className="flex items-center gap-2" aria-busy="true" aria-label={label}>
      <SpinnerIcon />
      <span>{label}</span>
    </div>
  );
}
