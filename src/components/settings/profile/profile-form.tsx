import { zodResolver } from "@hookform/resolvers/zod";
import { TRPCClientError } from "@trpc/client";
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
import { getAvatarUrl } from "../../../utils/avatar";

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

export default function ProfileForm({ session }: { session: Session }) {
  const { toast } = useToast();

  const { update } = useSession();

  const updateUser = api.user.update.useMutation({
    async onSuccess(updatedUser) {
      // refresh session data
      await update({
        name: updatedUser.name,
        username: updatedUser.username,
        image: updatedUser.image,
      });
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
    try {
      if (values.avatar) {
        // convert file to base64 or another format that can be sent via JSON
        const fileType = values.avatar.type;
        const reader = new FileReader();
        reader.readAsDataURL(values.avatar);
        reader.onloadend = async function () {
          const base64data = reader.result as string;
          // Remove data URL scheme
          const base64Index = base64data.indexOf("base64,") + "base64,".length;
          // upload avatar here
          const image = await uploadAvatar.mutateAsync({
            avatar: base64data.substring(base64Index),
            fileType: fileType,
          });
          await updateUser.mutateAsync({
            username: values.username,
            name: values.name,
            image: image,
          });
        };
      } else {
        await updateUser.mutateAsync({
          username: values.username,
          name: values.name,
        });
      }

      form.reset({ username: values.username, name: values.name });

      toast({
        description: "Your user profile is updated!",
      });
    } catch (err) {
      // TODO: get a better way to check if error is on the username field
      if (err instanceof TRPCClientError && err.message.includes("Username")) {
        form.setError("username", {
          type: "manual",
          message: err.message,
        });
      }
    }
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
                  placeholder={session.user.name || session.user.username}
                  avatarURL={getAvatarUrl(session.user.image)}
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
                  <Input placeholder="username" {...field} />
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
            Update profile
          </Button>
        </div>
      </form>
    </Form>
  );
}
