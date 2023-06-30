import { zodResolver } from "@hookform/resolvers/zod";
import { type Session } from "next-auth";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { AvatarUpload } from "~/components/ui/avatar-upload";
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

const profileSchema = z.object({
  username: z
    .string()
    .min(3, {
      message: "Username must be at least 3 characters.",
    })
    .max(28, {
      message: "Username cannot be longer than 28 characters.",
    }),
  name: z
    .string()
    .min(3, {
      message: "Name must be at least 3 characters.",
    })
    .max(75, {
      message: "Username cannot be longer than 75 characters.",
    }),
  avatar: z.optional(z.any()), // Assuming we have some way to validate files server-side
});

export function ProfileForm({ session }: { session: Session }) {
  const { toast } = useToast();

  const updateMutation = api.user.update.useMutation({});

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: session.user.username,
    },
  });

  async function onSubmit(values: z.infer<typeof profileSchema>) {
    if (values.avatar) {
      // upload avatar here

      let error, data;

      if (error) {
        toast({
          description: "couldn't upload avatar, please try again",
          variant: "destructive",
        });
        console.error(error);
      }

      // await updateMutation.mutateAsync({
      //   username: values.username,
      //   avatar: data?.path,
      // });
    } else {
      await updateMutation.mutateAsync({
        username: values.username,
      });
    }

    form.reset({ username: values.username });

    toast({
      description: "your user profile is updated!",
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex items-start gap-4"
      >
        <FormField
          control={form.control}
          name="avatar"
          render={({ field: { onChange } }) => (
            <FormItem>
              <FormControl>
                <AvatarUpload
                  username={session.user.username}
                  avatarURL={session.user.image}
                  onAvatarChange={onChange}
                  disabled={form.formState.isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex w-6/12 flex-col gap-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>username</FormLabel>
                <FormControl>
                  <Input placeholder="shadcn" {...field} />
                </FormControl>
                <FormDescription>
                  this is your public display name
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>full name</FormLabel>
                <FormControl>
                  <Input placeholder="first last" {...field} />
                </FormControl>
                <FormDescription>this is your full name</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={!form.formState.isDirty || form.formState.isSubmitting}
          >
            update profile
          </Button>
        </div>
      </form>
    </Form>
  );
}
