import Head from "next/head";
import { SettingsLayout } from "~/components/settings/layout";
import { APP_DESCRIPTION, APP_NAME } from "~/utils/constants";

export default function SettingsAccountPage() {
  return (
    <>
      <Head>
        <title>Account Settings | {APP_NAME}</title>
        <meta name="description" content={APP_DESCRIPTION} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <SettingsLayout>{}</SettingsLayout>
    </>
  );
}
