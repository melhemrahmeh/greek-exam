import type { ReactNode, SVGProps } from "react";
import { getScoreState } from "../features/study/utils";

/* ---------- Icons (inline SVG, no library) ---------- */

type IconName =
  | "home"
  | "book"
  | "verb"
  | "grammar"
  | "chat"
  | "close"
  | "star"
  | "star-filled"
  | "flag"
  | "flag-filled"
  | "sun"
  | "moon"
  | "check"
  | "x"
  | "back"
  | "inbox"
  | "chart";

const paths: Record<IconName, ReactNode> = {
  home: <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  book: (
    <>
      <path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H20v15H5.5A1.5 1.5 0 0 0 4 19.5z" />
      <path d="M4 19.5A1.5 1.5 0 0 0 5.5 21H20v-3" />
    </>
  ),
  verb: (
    <>
      <path d="M4 7h16M4 12h10M4 17h7" />
      <path d="m16 15 2 2 4-4" />
    </>
  ),
  grammar: (
    <>
      <path d="M4 20 9.5 5h1L16 20" />
      <path d="M6.5 14h7" />
      <path d="M18 9v11" />
    </>
  ),
  chat: <path d="M4 5h16v11H9l-5 4z" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  star: <path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" />,
  "star-filled": <path fill="currentColor" d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" />,
  flag: <path d="M5 21V4m0 0h11l-2 4 2 4H5" />,
  "flag-filled": <path fill="currentColor" d="M5 21V4m0 0h11l-2 4 2 4H5" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  moon: <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  x: <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />,
  back: <path d="M15 5 8 12l7 7" />,
  inbox: (
    <>
      <path d="M3 13h5l1.5 3h5l1.5-3h5" />
      <path d="M5 5h14l2 8v6H3v-6z" />
    </>
  ),
  chart: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
};

export function Icon({ name, ...rest }: { name: IconName } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {paths[name]}
    </svg>
  );
}

/* ---------- Score badge (one rule everywhere) ---------- */

export function ScoreBadge({ score, title }: { score: number | null | undefined; title?: string }) {
  const state = getScoreState(score);
  if (state === "new") {
    return (
      <span className="badge" title={title}>
        New
      </span>
    );
  }
  return (
    <span className={`badge badge-${state}`} title={title}>
      {state === "success" && <Icon name="check" width={12} height={12} />}
      {state === "success" ? `Passed · ${score}%` : `${score}%`}
    </span>
  );
}

/* ---------- Segmented control ---------- */

type SegmentedProps<T extends string> = {
  label: string;
  value: T;
  options: ReadonlyArray<{ value: T; label: string }>;
  onChange: (value: T) => void;
};

export function Segmented<T extends string>({ label, value, options, onChange }: SegmentedProps<T>) {
  return (
    <div className="segmented" role="group" aria-label={label}>
      {options.map((option) => (
        <button key={option.value} type="button" aria-pressed={value === option.value} onClick={() => onChange(option.value)}>
          {option.label}
        </button>
      ))}
    </div>
  );
}

/* ---------- Empty state ---------- */

export function EmptyState({
  icon = "inbox",
  children,
  action,
}: {
  icon?: IconName;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="empty">
      <Icon name={icon} />
      <p>{children}</p>
      {action}
    </div>
  );
}

/* ---------- Progress bar ---------- */

export function ProgressBar({ value, label, success }: { value: number; label: string; success?: boolean }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="progress" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(clamped)}>
      <div className={success ? "progress-fill is-success" : "progress-fill"} style={{ width: `${clamped}%` }} />
    </div>
  );
}

/* ---------- Search field with visible label ---------- */

export function SearchField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <input className="input" type="search" value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
