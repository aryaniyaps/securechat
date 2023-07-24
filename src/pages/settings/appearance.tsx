import Head from "next/head";
import { AppearanceForm } from "~/components/settings/appearance/appearance-form";
import { SettingsLayout } from "~/components/settings/layout";
import { Separator } from "~/components/ui/separator";
import { withAuth } from "~/components/with-auth";
import { APP_DESCRIPTION, APP_NAME } from "~/utils/constants";

function AppearanceSettingsPage() {
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
            <h3 className="text-lg font-medium">Appearance</h3>
            <p className="text-sm text-muted-foreground">
              Manage how your app looks here.
            </p>
          </div>
          <Separator />
          <AppearanceForm />
        </div>
      </SettingsLayout>
    </>
  );
}

export default withAuth(AppearanceSettingsPage);
