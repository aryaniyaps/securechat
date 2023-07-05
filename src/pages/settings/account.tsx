import { useSession } from "next-auth/react";
import Head from "next/head";
import { Icons } from "~/components/icons";
import { AccountForm } from "~/components/settings/account/account-form";
import { SettingsLayout } from "~/components/settings/layout";
import { Separator } from "~/components/ui/separator";
import { withAuth } from "~/utils/auth";
import { APP_DESCRIPTION, APP_NAME } from "~/utils/constants";

export default function AccountSettingsPage() {
  const { data: session } = useSession();
  if (!session) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center">
        <Icons.spinner className="h-8 w-8 animate-spin text-gray-400" />
      </main>
    );
  }
  return (
    <>
      <Head>
        <title>Account Settings | {APP_NAME}</title>
        <meta name="description" content={APP_DESCRIPTION} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <SettingsLayout>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">User account</h3>
            <p className="text-sm text-muted-foreground">
              Manage your user account.
            </p>
          </div>
          <Separator />
          <AccountForm session={session} />
        </div>
      </SettingsLayout>
    </>
  );
}

export const getServerSideProps = withAuth(async (_) => {
  return {
    props: {
      // page data here
    },
  };
});
