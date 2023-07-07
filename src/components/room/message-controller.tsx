import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Input } from "~/components/ui/input";
import { api } from "~/utils/api";
import { Form, FormControl, FormField, FormItem } from "../ui/form";

const createMessageSchema = z.object({
  content: z
    .string({ required_error: "Please enter a message." })
    .min(1, { message: "Message must be atleast 1 character." })
    .max(250, { message: "Message cannot exceed 25 characters." }),
});

export function MessageController({ roomId }: { roomId: string }) {
  const utils = api.useContext();

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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          name="content"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="send a message..." {...field} />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
