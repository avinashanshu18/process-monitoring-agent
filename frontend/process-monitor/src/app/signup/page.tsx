import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage({
  searchParams,
}: {
  searchParams?: { plan?: string };
}) {
  const requestedPlan =
    searchParams?.plan === "pro" || searchParams?.plan === "team"
      ? searchParams.plan
      : "free";

  return <SignupForm requestedPlan={requestedPlan} />;
}
