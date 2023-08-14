import { zodResolver } from "@hookform/resolvers/zod";
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { type SignInErrorTypes } from "next-auth/core/pages/signin";
import { getCsrfToken, getProviders, signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Icons } from "~/components/icons";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { getServerAuthSession } from "~/server/auth";
import { APP_NAME } from "~/utils/constants";

const signinSchema = z.object({
  email: z
    .string({ required_error: "Please enter your email address." })
    .email({ message: "Please enter a valid email address." }),
  csrfToken: z.string(),
  callbackUrl: z.optional(z.string()),
});

const errors: Record<SignInErrorTypes, string> = {
  Signin: "Try signing in with a different account.",
  OAuthSignin: "Try signing in with a different account.",
  OAuthCallback: "Try signing in with a different account.",
  OAuthCreateAccount: "Try signing in with a different account.",
  EmailCreateAccount: "Try signing in with a different account.",
  Callback: "Try signing in with a different account.",
  OAuthAccountNotLinked:
    "To confirm your identity, sign in with the same account you used originally.",
  EmailSignin: "The e-mail could not be sent.",
  CredentialsSignin:
    "Sign in failed. Check the details you provided are correct.",
  SessionRequired: "Please sign in to access this page.",
  default: "Unable to sign in.",
};

export default function SignIn({
  providers,
  csrfToken,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();

  const { callbackUrl, error } = router.query;

  const form = useForm<z.infer<typeof signinSchema>>({
    resolver: zodResolver(signinSchema),
    defaultValues: { email: "", csrfToken, callbackUrl: String(callbackUrl) },
  });

  async function onSubmit(values: z.infer<typeof signinSchema>) {
    await signIn("email", {
      email: values.email,
      callbackUrl: String(callbackUrl),
      redirect: true,
    });
  }

  return (
    <div className="container mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center p-8">
      <div className="flex w-full flex-col justify-center space-y-6">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Sign In to <Link href="/">{APP_NAME}</Link>
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your email to sign in to your account.
          </p>
        </div>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>
              <p className="w-full text-center text-sm font-semibold">
                {errors[error as SignInErrorTypes] ?? errors.default}
              </p>
            </AlertDescription>
          </Alert>
        )}
        {Object.values(providers).map((provider) => {
          switch (provider.type) {
            case "email":
              return (
                <Form {...form} key={provider.id}>
                  <form
                    method="POST"
                    action="/api/auth/signin/email"
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="grid gap-6"
                  >
                    <div className="grid gap-4">
                      <div className="grid gap-1">
                        <FormField
                          control={form.control}
                          name="csrfToken"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input type="hidden" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="callbackUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input type="hidden" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  autoFocus
                                  placeholder="name@example.com"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <Button
                        disabled={form.formState.isSubmitting}
                        type="submit"
                      >
                        {form.formState.isSubmitting && (
                          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Sign In with {provider.name}
                      </Button>
                    </div>
                  </form>
                </Form>
              );
            case "oauth":
              switch (provider.name) {
                case "Google":
                  return (
                    <Button
                      key={provider.id}
                      className="w-full"
                      variant="outline"
                      onClick={() =>
                        signIn(provider.id, {
                          callbackUrl: String(callbackUrl),
                        })
                      }
                    >
                      <Icons.google className="mr-2 h-4 w-4" /> {provider.name}
                    </Button>
                  );
              }
          }
        })}

        <p className="px-8 text-center text-sm text-muted-foreground">
          By clicking continue, you agree to our{" "}
          <Link
            href="/terms"
            className="underline underline-offset-4 hover:text-primary"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="underline underline-offset-4 hover:text-primary"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerAuthSession(context);

  // If the user is already logged in, redirect.
  let redirectUrl = String(context.query.callbackUrl || "/");

  if (redirectUrl === "/signin") {
    // Note: Make sure not to redirect to the same page
    // To avoid an infinite loop!
    redirectUrl = "/";
  }

  if (session) {
    return { redirect: { destination: redirectUrl } };
  }

  const csrfToken = await getCsrfToken(context);

  const providers = await getProviders();

  return {
    props: { providers: providers ?? [], csrfToken },
  };
}
