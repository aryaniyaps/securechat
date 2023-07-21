import { TRPCClientError } from "@trpc/client";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Icons } from "~/components/icons";
import { api } from "~/utils/api";
import { withAuth } from "~/utils/auth";

export default function EmailChangePage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const changeEmail = api.user.changeEmail.useMutation({
    onError: (err) => {
      if (err instanceof TRPCClientError) {
        setError(err.message);
      }
    },
    onSuccess: async () => {
      await router.replace("/settings/account");
    },
  });
  const { changeToken, newEmail } = router.query;

  useEffect(() => {
    async function completeEmailChange() {
      if (changeToken && newEmail) {
        await changeEmail.mutateAsync({
          newEmail: String(newEmail),
          changeToken: String(changeToken),
        });
      }
      setLoading(false);
    }

    completeEmailChange().catch((err) => console.error(err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [changeToken, newEmail, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center font-medium text-primary">
        <p>Completing email change...</p>
        <Icons.spinner className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center font-medium text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center gap-2 font-medium text-primary">
      <p>redirecting...</p>
      <Icons.spinner className="h-4 w-4 animate-spin" />
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/require-await
export const getServerSideProps = withAuth(async (_) => {
  return {
    props: {
      // page data here
    },
  };
});
