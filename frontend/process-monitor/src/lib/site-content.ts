import {
  Activity,
  AppWindowMac,
  BellRing,
  Clock3,
  Eye,
  Fingerprint,
  LayoutDashboard,
  GitCompareArrows,
  SearchCheck,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  UserRound,
  Users2,
  Wallet,
} from "lucide-react";

export const productName = "HostLens";
export const salesEmail =
  process.env.NEXT_PUBLIC_SALES_EMAIL ?? "anshuavinash844@gmail.com";

export const appNavigation = [
  { label: "Overview", href: "/app", icon: LayoutDashboard },
  { label: "Alerts", href: "/app/alerts", icon: ShieldAlert },
  { label: "History", href: "/app/history", icon: Clock3 },
  { label: "Software", href: "/app/software", icon: AppWindowMac },
  { label: "Integrity", href: "/app/integrity", icon: Fingerprint },
  { label: "Policies", href: "/app/policies", icon: SearchCheck },
  { label: "Services", href: "/app/services", icon: Shield },
  { label: "Collectors", href: "/app/collectors", icon: ShieldCheck },
  { label: "Compare", href: "/app/compare", icon: GitCompareArrows },
  { label: "Investigate", href: "/app/investigations", icon: Eye },
  { label: "Team", href: "/app/team", icon: Users2 },
  { label: "Billing", href: "/app/billing", icon: Wallet },
  { label: "Profile", href: "/app/profile", icon: UserRound },
];

export const trustSignals = [
  {
    label: "Primary promise",
    value: "Know which device needs action right now",
    body: "HostLens is built for small teams that need fast answers on suspicious process, persistence, and device drift without buying an enterprise platform.",
  },
  {
    label: "Installation model",
    value: "Signed-installer ready release pipeline",
    body: "The rollout path is structured around downloadable installers, checksum verification, and account-bound config instead of copy-pasted telemetry scripts.",
  },
  {
    label: "Best-fit customer",
    value: "$39/month Team plan for compact fleets",
    body: "Designed for agencies, MSPs, and internal operator teams managing roughly 5 to 25 critical devices with shared alert ownership.",
  },
];

export const featureRows = [
  {
    title: "One command surface for live device triage",
    body:
      "Open one workspace and see live device status, policy failures, process inventory, services, integrity drift, and alert posture without stitching together multiple monitoring products.",
    icon: Eye,
  },
  {
    title: "Operator-grade checks and remediation actions",
    body:
      "Saved checks, live query, patch posture, mobile compliance, and queued actions turn telemetry into something a small team can actually operate against.",
    icon: ShieldCheck,
  },
  {
    title: "Built for compact teams, not enterprise shelfware",
    body:
      "The Team plan keeps pricing, seats, retention, and workflow matched to real small-fleet operations instead of forcing a jump to enterprise procurement.",
    icon: Sparkles,
  },
];

export const planTiers = [
  {
    name: "Free",
    price: "$0",
    cadence: "/month",
    description: "For validating the workflow on your own machines before you move a real team into the workspace.",
    features: [
      "Monitor up to 2 devices",
      "Live web workspace and process explorer",
      "24-hour snapshot history",
      "Manual install and local validation path",
    ],
    cta: "Create free account",
    href: "/signup?plan=free",
    tone: "secondary" as const,
  },
  {
    name: "Pro",
    price: "$12",
    cadence: "/month",
    description: "For freelancers and founders who want a private device control room before they expand to a shared operator workflow.",
    features: [
      "Up to 8 devices",
      "Real-time alert feed, checks, and live query",
      "30-day device history",
      "Priority onboarding and install support",
    ],
    cta: "Create Pro account",
    href: "/signup?plan=pro",
    tone: "secondary" as const,
  },
  {
    name: "Team",
    price: "$39",
    cadence: "/month",
    description: "For agencies, MSPs, and internal security or ops teams managing a compact fleet with shared responsibility and real alert review.",
    features: [
      "Up to 25 devices",
      "Shared alert review and remediation workflow",
      "5 teammate seats with role-based access",
      "90-day retention",
      "Policy engine, patch posture, and mobile compliance",
      "Fast rollout path for macOS, Linux, and Windows",
    ],
    cta: "Create Team account",
    href: "/signup?plan=team",
    tone: "primary" as const,
    featured: true,
  },
];

export const proofPoints = [
  { label: "Target plan", value: "Team at $39/month" },
  { label: "Ideal customer", value: "MSPs, agencies, and lean internal teams" },
  { label: "Delivery model", value: "Responsive web SaaS with install-first onboarding" },
];

export const appHighlights = [
  {
    label: "Policy control",
    body: "Saved checks, patch posture, and live query surface the operator questions that matter right after install.",
    icon: Activity,
  },
  {
    label: "Alert review",
    body: "See which device changed, why it matters, and whether a responder already acted on it.",
    icon: BellRing,
  },
  {
    label: "Deployment proof",
    body: "Installers, checksums, onboarding config, and a web-first activation path reduce the time from signup to first device.",
    icon: Clock3,
  },
];

export const buyingTriggers = [
  "A client laptop or internal workstation starts behaving strangely and nobody has a fast answer.",
  "A small team needs device visibility, policy checks, and alert review without paying for a full enterprise endpoint platform.",
  "An MSP or agency wants one place to watch a compact fleet without building an internal tooling stack first.",
];

export const operatingPrinciples = [
  {
    label: "Sharp wedge",
    body: "HostLens is sold as a small-fleet device security visibility product, not as another generic monitoring bundle.",
  },
  {
    label: "Ship trust first",
    body: "Installer trust, real billing state, delivery confidence, and clean onboarding matter more than padding the feature list.",
  },
  {
    label: "Built for real operators",
    body: "The copy, pricing, and workflow are tuned for the person who installs the agent, reviews alerts, and owns the rollout themselves.",
  },
];
