import { type GetServerSidePropsContext } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { Icons } from "~/components/icons";
import { SettingsLayout } from "~/components/settings/layout";
import { ProfileForm } from "~/components/settings/profile/profile-form";
import { Separator } from "~/components/ui/separator";
import { getServerAuthSession } from "~/server/auth";
import { APP_DESCRIPTION, APP_NAME } from "~/utils/constants";

export default function SettingsPage() {
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
        <title>Settings | {APP_NAME}</title>
        <meta name="description" content={APP_DESCRIPTION} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <SettingsLayout>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">user profile</h3>
            <p className="text-sm text-muted-foreground">
              this is how others will see you on {APP_NAME}
            </p>
          </div>
          <Separator />
          <ProfileForm session={session} />
        </div>
      </SettingsLayout>
    </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerAuthSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/auth/signin",
        permanent: false,
      },
    };
  }

  return {
    props: {}, // You can add additional props here if needed
  };
}
