import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { next?: string };
}) {
  return <LoginForm nextPath={searchParams?.next || "/app"} />;
}
