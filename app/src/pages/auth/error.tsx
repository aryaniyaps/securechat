import { type GetServerSidePropsContext } from "next";
import { type ErrorType } from "next-auth/core/pages/error";
import Link from "next/link";
import { useRouter } from "next/router";
import { Button } from "~/components/ui/button";
import { getServerAuthSession } from "~/server/auth";
import { APP_NAME } from "~/utils/constants";

interface ErrorView {
  status: number;
  heading: string;
  message: JSX.Element;
  signin?: JSX.Element;
}

export default function AuthErrorPage() {
  const router = useRouter();

  const error = router.query.error as ErrorType; // Explicitly cast the type

  const errors: Record<ErrorType, ErrorView> = {
    default: {
      status: 200,
      heading: "Unknown Error",
      message: (
        <div className="flex flex-col gap-4">
          <p>An unexpected error occurred.</p>
          <Link href="/">
            <Button variant="outline">Go back to {APP_NAME}</Button>
          </Link>
        </div>
      ),
    },
    configuration: {
      status: 500,
      heading: "Server error",
      message: (
        <div className="flex flex-col gap-2">
          <p>There is a problem with the server configuration.</p>
          <p>Check the server logs for more information.</p>
        </div>
      ),
    },
    accessdenied: {
      status: 403,
      heading: "Access Denied",
      message: (
        <div className="flex flex-col gap-4">
          <p>You do not have permission to sign in.</p>
          <Link href="/auth/signin">
            <Button variant="outline">Sign in</Button>
          </Link>
        </div>
      ),
    },
    verification: {
      status: 403,
      heading: "Unable to sign in",
      message: (
        <div>
          <p>The sign in link is no longer valid.</p>
          <p>It may have been used already or it may have expired.</p>
        </div>
      ),
      signin: (
        <Link href="/auth/signin">
          <Button variant="outline">Sign in</Button>
        </Link>
      ),
    },
  };

  const errorKey = (error || "default").toLowerCase() as ErrorType;

  // TODO: set appropriate status also?
  const { heading, message, signin } = errors[errorKey] ?? errors.default;

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-lg font-semibold">{heading}</h1>
      <div className="text-sm">{message}</div>
      {signin}
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerAuthSession(context);

  // If the user is already logged in, redirect.
  // Note: Make sure not to redirect to the same page
  // To avoid an infinite loop!
  if (session) {
    return { redirect: { destination: "/" } };
  }
  return { props: {} };
}
