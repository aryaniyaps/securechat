import { useSession } from "next-auth/react";
import Head from "next/head";
import LoadingScreen from "~/components/loading-screen";
import SettingsLayout from "~/components/settings/layout";
import ProfileForm from "~/components/settings/profile/profile-form";
import { Separator } from "~/components/ui/separator";
import { withAuth } from "~/components/with-auth";
import { APP_DESCRIPTION, APP_NAME } from "~/utils/constants";

function SettingsPage() {
  const { data: session } = useSession();
  if (!session) {
    return <LoadingScreen />;
  }
  return (
    <>
      <Head>
        <title>Settings | {APP_NAME}</title>
        <meta name="description" content={APP_DESCRIPTION} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <SettingsLayout>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">User profile</h3>
            <p className="text-sm text-muted-foreground">
              This is how others will see you on {APP_NAME}.
            </p>
          </div>
          <Separator />
          <ProfileForm session={session} />
        </div>
      </SettingsLayout>
    </>
  );
}

export default withAuth(SettingsPage);
