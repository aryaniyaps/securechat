import { useSession } from "next-auth/react";
import Head from "next/head";
import { LoadingScreen } from "~/components/loading-screen";
import { AccountForm } from "~/components/settings/account/account-form";
import { SettingsLayout } from "~/components/settings/layout";
import { Separator } from "~/components/ui/separator";
import { withAuth } from "~/components/with-auth";
import { APP_DESCRIPTION, APP_NAME } from "~/utils/constants";

function AccountSettingsPage() {
  const { data: session } = useSession();
  if (!session) {
    return <LoadingScreen />;
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

export default withAuth(AccountSettingsPage);
