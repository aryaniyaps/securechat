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
import { getAvatarUrl } from "~/utils/avatar";

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

  const createAvatarPresignedUrl =
    api.user.createAvatarPresignedUrl.useMutation();

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: session.user.username,
      name: session.user.name || "",
    },
  });

  async function uploadAvatar(avatar: Blob, presignedUrl: string) {
    const response = await fetch(presignedUrl, {
      method: "PUT",
      body: avatar,
      headers: {
        "Content-Type": avatar.type,
      },
    });
    return response.ok;
  }

  async function updateProfile(
    values: z.infer<typeof profileSchema>,
    fileName: string | null
  ) {
    await updateUser.mutateAsync({
      username: values.username,
      name: values.name,
      ...(fileName && { image: fileName }),
    });
  }

  async function onSubmit(values: z.infer<typeof profileSchema>) {
    try {
      let fileName = null;

      if (values.avatar) {
        const { presignedUrl, fileName: generatedFileName } =
          await createAvatarPresignedUrl.mutateAsync({
            contentType: values.avatar.type,
          });
        const isUploadSuccessful = await uploadAvatar(
          values.avatar,
          presignedUrl
        );

        if (!isUploadSuccessful) {
          toast({
            description: "Couldn't upload avatar!",
            variant: "destructive",
          });
        } else {
          fileName = generatedFileName;
        }
      }

      await updateProfile(values, fileName);
      form.reset({ username: values.username, name: values.name });
    } catch (err) {
      if (err instanceof TRPCClientError) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if ("code" in err.data && err.data.code === "CONFLICT") {
          form.setError("username", { type: "manual", message: err.message });
        } else {
          toast({ description: err.message, variant: "destructive" });
        }
      }
    }
  }

  return (
    <Form {...form} data-testid="profile-form">
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
                  avatarURL={getAvatarUrl(
                    session.user.image,
                    session.user.username
                  )}
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
