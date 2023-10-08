import { createServerSideHelpers } from "@trpc/react-query/server";
import superjson from "superjson";
import { appRouter } from "../api/root";
import { createInnerTRPCContext } from "../api/trpc";

// it is not recommended to make direct API Calls (like fetch)
// from getServerSideProps or staticProps.

// instead, we are asked to take that logic and put it in the function directly
// but the trpc nextjs docs ask us to do the prefetching using the ssg helpers only
// https://trpc.io/docs/client/nextjs/server-side-helpers#nextjs-example

// while running next build, the nextjs static worker somehow runs runtime code
// and attempts to connect to RabbitMQ too?!

// maybe we can upgrade to nextjs 13 and separate server side code completely

// or we can have a separate backend that prevents this whole mess of coupled client
// and server side code (the only challenge here is to make nextauth.js play well with
// the credentials provider)
export function ssgHelper() {
  return createServerSideHelpers({
    router: appRouter,
    ctx: createInnerTRPCContext({ session: null, revalidateSSG: null }),
    transformer: superjson,
  });
}
