import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { api } from "~/utils/api";
import { Icons } from "../icons";
import { Button } from "../ui/button";
import { Form, FormControl, FormField, FormItem } from "../ui/form";
import { Input } from "../ui/input";

const createMessageSchema = z.object({
  content: z
    .string({ required_error: "Please enter a message." })
    .min(1, { message: "Message must be at least 1 character." })
    .max(250, { message: "Message cannot exceed 250 characters." }), // Updated max limit
});

export default function MessageController({ roomId }: { roomId: string }) {
  const form = useForm<z.infer<typeof createMessageSchema>>({
    resolver: zodResolver(createMessageSchema),
    defaultValues: {
      content: "",
    },
  });

  const createMessage = api.message.create.useMutation({});

  async function onSubmit(values: z.infer<typeof createMessageSchema>) {
    await createMessage.mutateAsync({ content: values.content, roomId });
    form.reset({ content: "" });
  }

  return (
    <Form {...form} data-testid="message-controller">
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mb-6 flex w-full items-center gap-4"
      >
        <FormField
          name="content"
          control={form.control}
          render={({ field }) => (
            <FormItem className="w-full flex-grow">
              <FormControl>
                <Input
                  placeholder="send a message..."
                  className="px-4 py-6"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button
          variant="secondary"
          type="submit"
          className="py-6"
          disabled={!form.formState.isValid}
        >
          <Icons.send size={20} className="h-4 w-4" />
        </Button>
      </form>
    </Form>
  );
}
