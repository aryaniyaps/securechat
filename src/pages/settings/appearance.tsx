import Head from "next/head";
import { AppearanceForm } from "~/components/settings/appearance/appearance-form";
import { SettingsLayout } from "~/components/settings/layout";
import { Separator } from "~/components/ui/separator";
import { withAuth } from "~/utils/auth";
import { APP_DESCRIPTION, APP_NAME } from "~/utils/constants";

export default function AppearanceSettingsPage() {
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

export const getServerSideProps = withAuth(async (_) => {
  return {
    props: {
      // page data here
    },
  };
});
