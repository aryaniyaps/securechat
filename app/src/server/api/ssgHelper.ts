import { createServerSideHelpers } from "@trpc/react-query/server";
import superjson from "superjson";
import { appRouter } from "./root";
import { createInnerTRPCContext } from "./trpc";

export function ssgHelper() {
  return createServerSideHelpers({
    router: appRouter,
    ctx: createInnerTRPCContext({ session: null, revalidateSSG: null }),
    transformer: superjson,
  });
}
