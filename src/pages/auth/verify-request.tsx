import { type GetServerSidePropsContext } from "next";
import { getServerAuthSession } from "~/server/auth";

export default function VerifyRequestPage() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center">
      <h1>Please check your email</h1>
      <p>A sign in link has been sent to your email address.</p>
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
