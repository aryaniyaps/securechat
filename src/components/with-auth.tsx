import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

export function withAuth<P>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: React.PropsWithChildren<P>) {
    const { status } = useSession();
    const router = useRouter();

    useEffect(() => {
      if (status === "unauthenticated") {
        const callbackUrl = `${window.location.origin}${router.asPath}`;
        const url = new URL("/auth/signin", window.location.origin);
        url.searchParams.append("callbackUrl", callbackUrl);
        void router.push(url);
      }
    }, [status, router]);

    if (status === "loading") {
      return null;
    }

    return <Component {...props} />;
  };
}
