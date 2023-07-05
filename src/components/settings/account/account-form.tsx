import * as React from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { TRPCClientError } from "@trpc/client";
import { type Session } from "next-auth";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { useToast } from "~/hooks/use-toast";
import { api } from "~/utils/api";

const userSchema = z.object({
  email: z
    .string({ required_error: "please enter your email" })
    .email({ message: "please enter a valid email" }),
});

interface AccountFormProps extends React.HTMLAttributes<HTMLFormElement> {
  session: Session;
}

export function AccountForm({ session, ...props }: AccountFormProps) {
  const { toast } = useToast();

  const requestEmailChangeMutation = api.user.requestEmailChange.useMutation();

  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: session.user.email || "",
    },
  });

  async function onSubmit(values: z.infer<typeof userSchema>) {
    try {
      await requestEmailChangeMutation.mutateAsync({ newEmail: values.email });

      form.reset({ email: session.user.email || "" });

      toast({
        description: `We have sent a confirmation email to ${values.email}. Please follow instructions from there to change your email`,
      });
    } catch (error) {
      if (error instanceof TRPCClientError) {
        form.setError("email", { message: error.message });
      } else {
        toast({
          description: "Unexpected error occurred. Please try again",
          variant: "destructive",
        });
      }
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-6/12 flex-col gap-4"
        {...props}
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>email address</FormLabel>
              <FormControl>
                <Input placeholder="example@gmail.com" {...field} />
              </FormControl>
              <FormDescription>your email address is private</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={!form.formState.isDirty || form.formState.isSubmitting}
        >
          update account
        </Button>
      </form>
    </Form>
  );
}
