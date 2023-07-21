import {
  type GetServerSideProps,
  type GetServerSidePropsContext,
  type GetServerSidePropsResult,
} from "next";
import { type ParsedUrlQuery } from "querystring";
import { env } from "~/env.mjs";
import { getServerAuthSession } from "~/server/auth";

export function withAuth<
  Props extends { [key: string]: any } = { [key: string]: any },
  Params extends ParsedUrlQuery = ParsedUrlQuery
>(
  getServerSidePropsFunc?: (
    context: GetServerSidePropsContext<Params>
  ) => Promise<GetServerSidePropsResult<Props>>
): GetServerSideProps<Props, Params> {
  return async (context: GetServerSidePropsContext<Params>) => {
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
    if (getServerSidePropsFunc) {
      const result = await getServerSidePropsFunc(context);
      if (result) {
        return result;
      }
    }

    return {
      props: {} as Props,
    };
  };
}
