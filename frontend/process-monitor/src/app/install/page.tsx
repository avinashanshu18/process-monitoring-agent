import { InstallPage } from "@/components/marketing/install-page";

export default async function InstallRoute({
  searchParams,
}: {
  searchParams?: Promise<{ checkout?: string }>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};

  return <InstallPage checkoutStatus={resolvedSearchParams.checkout} />;
}
