// FILE-EXCEPTION: file length
"use client";

import type React from "react";

/**
 * Interface defining property specifications, keys types, and structural contract rules for icon props.
 */
export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

/**
 * Exported constant defining parameters and fields for rocket icon configurations.
 */
export const RocketIcon = ({ size = 16, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path
      d={
        "M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09" +
        "-2.91a2.18 2.18 0 0 0-2.91-.09z"
      }
    />
    <path
      d={
        "m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 " +
        "2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"
      }
    />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
);

/**
 * Exported constant defining parameters and fields for book open icon configurations.
 */
export const BookOpenIcon = ({ size = 16, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

/**
 * Exported constant defining parameters and fields for layout icon configurations.
 */
export const LayoutIcon = ({ size = 16, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
    <line x1="3" x2="21" y1="9" y2="9" />
    <line x1="9" x2="9" y1="21" y2="9" />
  </svg>
);

/**
 * Exported constant defining parameters and fields for star icon configurations.
 */
export const StarIcon = ({ size = 16, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <polygon
      points={
        "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 " +
        "17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
      }
    />
  </svg>
);

/**
 * Exported constant defining parameters and fields for monitor icon configurations.
 */
export const MonitorIcon = ({ size = 16, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="20" height="14" x="2" y="3" rx="2" />
    <line x1="8" x2="16" y1="21" y2="21" />
    <line x1="12" x2="12" y1="17" y2="21" />
  </svg>
);

/**
 * Exported constant defining parameters and fields for shield icon configurations.
 */
export const ShieldIcon = ({ size = 16, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path
      d={
        "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 " +
        "20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72" +
        "a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 " +
        "0 1 1 1z"
      }
    />
  </svg>
);

/**
 * Exported constant defining parameters and fields for code icon configurations.
 */
export const CodeIcon = ({ size = 16, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

/**
 * Exported constant defining parameters and fields for server icon configurations.
 */
export const ServerIcon = ({ size = 16, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="20" height="8" x="2" y="2" rx="2" ry="2" />
    <rect width="20" height="8" x="2" y="14" rx="2" ry="2" />
    <line x1="6" x2="6.01" y1="6" y2="6" />
    <line x1="6" x2="6.01" y1="18" y2="18" />
  </svg>
);

/**
 * Exported constant defining parameters and fields for briefcase icon configurations.
 */
export const BriefcaseIcon = ({ size = 16, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    <rect width="20" height="14" x="2" y="6" rx="2" />
  </svg>
);

/**
 * Exported constant defining parameters and fields for layers icon configurations.
 */
export const LayersIcon = ({ size = 16, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path
      d={
        "m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 " +
        "1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"
      }
    />
    <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
    <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
  </svg>
);

/**
 * Exported constant defining parameters and fields for building icon configurations.
 */
export const BuildingIcon = ({ size = 16, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
    <path d="M9 22v-4h6v4" />
    <path d="M8 6h.01" />
    <path d="M16 6h.01" />
    <path d="M8 10h.01" />
    <path d="M16 10h.01" />
    <path d="M8 14h.01" />
    <path d="M16 14h.01" />
  </svg>
);

/**
 * Exported constant defining parameters and fields for cpu icon configurations.
 */
export const CpuIcon = ({ size = 16, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="16" height="16" x="4" y="4" rx="2" />
    <rect width="6" height="6" x="9" y="9" rx="1" />
    <path d="M15 2v2" />
    <path d="M15 20v2" />
    <path d="M2 15h2" />
    <path d="M2 9h2" />
    <path d="M20 15h2" />
    <path d="M20 9h2" />
    <path d="M9 2v2" />
    <path d="M9 20v2" />
  </svg>
);

/**
 * Exported constant defining parameters and fields for link icon configurations.
 */
export const LinkIcon = ({ size = 16, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

/**
 * Exported constant defining parameters and fields for globe icon configurations.
 */
export const GlobeIcon = ({ size = 16, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
    <path d="M2 12h20" />
  </svg>
);

/**
 * Exported constant defining parameters and fields for zap icon configurations.
 */
export const ZapIcon = ({ size = 16, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path
      d={
        "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46" +
        "l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63" +
        "l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"
      }
    />
  </svg>
);

/**
 * Exported constant defining parameters and fields for users icon configurations.
 */
export const UsersIcon = ({ size = 16, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

/**
 * Exported constant defining parameters and fields for bar chart icon configurations.
 */
export const BarChartIcon = ({ size = 16, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <line x1="12" x2="12" y1="20" y2="10" />
    <line x1="18" x2="18" y1="20" y2="4" />
    <line x1="6" x2="6" y1="20" y2="16" />
  </svg>
);

/**
 * Exported constant defining parameters and fields for book icon configurations.
 */
export const BookIcon = ({ size = 16, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path
      d={
        "M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18" +
        "a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"
      }
    />
  </svg>
);

/**
 * Exported constant defining parameters and fields for database icon configurations.
 */
export const DatabaseIcon = ({ size = 16, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M3 5V19A9 3 0 0 0 21 19V5" />
    <path d="M3 12A9 3 0 0 0 21 12" />
  </svg>
);

/**
 * Exported constant defining parameters and fields for boxes icon configurations.
 */
export const BoxesIcon = ({ size = 16, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path
      d={
        "M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3" +
        " 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z"
      }
    />
    <path d="m7 16.5-4.74-2.85" />
    <path d="m7 16.5 5-3" />
    <path d="M7 16.5v5.17" />
    <path
      d={
        "M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0" +
        " .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z"
      }
    />
    <path d="m17 16.5-5-3" />
    <path d="m17 16.5 4.74-2.85" />
    <path d="M17 16.5v5.17" />
    <path
      d={
        "M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0" +
        "-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z"
      }
    />
    <path d="M12 8 7.26 5.15" />
    <path d="m12 8 4.74-2.85" />
    <path d="M12 13.5V8" />
  </svg>
);

/**
 * Exported constant defining parameters and fields for hard drive icon configurations.
 */
export const HardDriveIcon = ({ size = 16, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <line x1="22" x2="2" y1="12" y2="12" />
    <path
      d={
        "M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6" +
        "l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"
      }
    />
    <line x1="6" x2="6.01" y1="16" y2="16" />
    <line x1="10" x2="10.01" y1="16" y2="16" />
  </svg>
);

/**
 * Exported constant defining parameters and fields for git branch icon configurations.
 */
export const GitBranchIcon = ({ size = 16, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <line x1="6" x2="6" y1="3" y2="15" />
    <circle cx="18" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <path d="M18 9a9 9 0 0 1-9 9" />
  </svg>
);

/**
 * Exported constant defining parameters and fields for terminal icon configurations.
 */
export const TerminalIcon = ({ size = 16, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <polyline points="4 17 10 11 4 5" />
    <line x1="12" x2="20" y1="19" y2="19" />
  </svg>
);

/**
 * Exported constant defining parameters and fields for package icon configurations.
 */
export const PackageIcon = ({ size = 16, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="m7.5 4.27 9 5.15" />
    <path
      d={
        "M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 " +
        "0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"
      }
    />
    <path d="m3.3 7 8.7 5 8.7-5" />
    <path d="M12 22V12" />
  </svg>
);

/**
 * Exported constant defining parameters and fields for key icon configurations.
 */
export const KeyIcon = ({ size = 16, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path
      d={
        "m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 " +
        "5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"
      }
    />
  </svg>
);

/**
 * Exported constant defining parameters and fields for scale icon configurations.
 */
export const ScaleIcon = ({ size = 16, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
    <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
    <path d="M7 21h10" />
    <path d="M12 3v18" />
    <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
  </svg>
);

/**
 * Exported constant defining parameters and fields for chevron right icon configurations.
 */
export const ChevronRightIcon = ({ size = 14, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
);

/**
 * Exported constant defining parameters and fields for docs icons configurations.
 */
export const docsIcons: Record<string, (props: IconProps) => React.ReactNode> = {
  rocket: (props) => <RocketIcon {...props} />,
  "book-open": (props) => <BookOpenIcon {...props} />,
  layout: (props) => <LayoutIcon {...props} />,
  star: (props) => <StarIcon {...props} />,
  monitor: (props) => <MonitorIcon {...props} />,
  shield: (props) => <ShieldIcon {...props} />,
  code: (props) => <CodeIcon {...props} />,
  server: (props) => <ServerIcon {...props} />,
  briefcase: (props) => <BriefcaseIcon {...props} />,
  layers: (props) => <LayersIcon {...props} />,
  building: (props) => <BuildingIcon {...props} />,
  cpu: (props) => <CpuIcon {...props} />,
  link: (props) => <LinkIcon {...props} />,
  globe: (props) => <GlobeIcon {...props} />,
  zap: (props) => <ZapIcon {...props} />,
  users: (props) => <UsersIcon {...props} />,
  "bar-chart": (props) => <BarChartIcon {...props} />,
  book: (props) => <BookIcon {...props} />,
  database: (props) => <DatabaseIcon {...props} />,
  boxes: (props) => <BoxesIcon {...props} />,
  "hard-drive": (props) => <HardDriveIcon {...props} />,
  "git-branch": (props) => <GitBranchIcon {...props} />,
  terminal: (props) => <TerminalIcon {...props} />,
  package: (props) => <PackageIcon {...props} />,
  key: (props) => <KeyIcon {...props} />,
  scale: (props) => <ScaleIcon {...props} />,
};
