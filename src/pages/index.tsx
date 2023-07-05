import { useSession } from "next-auth/react";
import Head from "next/head";
import { HomeLayout } from "~/components/home/layout";
import { Icons } from "~/components/icons";
import { withAuth } from "~/utils/auth";
import { APP_DESCRIPTION, APP_NAME } from "~/utils/constants";

export default function HomePage() {
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
        <title>{APP_NAME}</title>
        <meta name="description" content={APP_DESCRIPTION} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <HomeLayout session={session}>{}</HomeLayout>
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
