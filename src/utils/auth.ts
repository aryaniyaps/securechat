import { type GetServerSideProps, type GetServerSidePropsContext } from "next";
import { env } from "~/env.mjs";
import { getServerAuthSession } from "~/server/auth";

export function withAuth(getServerSidePropsFunc: GetServerSideProps) {
  return async function (context: GetServerSidePropsContext) {
    const session = await getServerAuthSession(context);

    if (!session) {
      const url = new URL("/auth/signin", env.NEXT_PUBLIC_SITE_URL);
      url.searchParams.append("callbackUrl", context.resolvedUrl);

      return {
        redirect: {
          destination: url.pathname + url.search,
          permanent: false,
        },
      };
    }

    // Run the getServerSideProps function that was passed in, if any
    let props = {};
    if (getServerSidePropsFunc) {
      const result = await getServerSidePropsFunc(context);
      if ("props" in result) {
        props = result.props;
      }
    }

    return {
      props: props,
    };
  };
}
