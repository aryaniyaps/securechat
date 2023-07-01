import { zodResolver } from "@hookform/resolvers/zod";
import { type Session } from "next-auth";
import { useSession } from "next-auth/react";
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
  name: z.optional(
    z.string().max(75, {
      message: "Username cannot be longer than 75 characters.",
    })
  ),
  avatar: z.optional(z.instanceof(Blob)),
});

export function ProfileForm({ session }: { session: Session }) {
  const { toast } = useToast();

  const { update } = useSession();

  const updateUser = api.user.update.useMutation({
    async onSuccess() {
      // refresh session data
      await update();
    },
  });

  const uploadAvatar = api.user.uploadAvatar.useMutation();

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: session.user.username,
      name: session.user.name || "",
    },
  });

  async function onSubmit(values: z.infer<typeof profileSchema>) {
    let imageUrl;
    if (values.avatar) {
      // convert file to base64 or another format that can be sent via JSON
      const reader = new FileReader();
      reader.readAsDataURL(values.avatar);
      reader.onloadend = async function () {
        const base64data = reader.result as string;
        // upload avatar here
        imageUrl = await uploadAvatar.mutateAsync({
          avatar: base64data,
        });
      };
    }
    await updateUser.mutateAsync({
      username: values.username,
      name: values.name,
      avatarUrl: imageUrl,
    });

    form.reset({ username: values.username, name: values.name });

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
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="first last" {...field} />
                </FormControl>
                <FormDescription>This is your full name.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="shadcn" {...field} />
                </FormControl>
                <FormDescription>
                  This is your public display name.
                </FormDescription>
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
