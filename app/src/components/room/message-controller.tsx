import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useCurrentRoomStore } from "~/hooks/stores/useCurrentRoomStore";
import { TypingUser } from "~/schemas/typing";
import { api } from "~/utils/api";
import { TYPING_INDICATOR_DELAY } from "~/utils/constants";
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
  const { typing } = useCurrentRoomStore();

  const [isTyping, setIsTyping] = useState(false);

  const form = useForm<z.infer<typeof createMessageSchema>>({
    resolver: zodResolver(createMessageSchema),
    defaultValues: {
      content: "",
    },
  });

  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const createMessage = api.message.create.useMutation({});

  const addTypingUser = api.typing.addUser.useMutation({});

  const removeTypingUser = api.typing.removeUser.useMutation({});

  const handleTyping = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only send a request when the user starts typing
    if (!isTyping) {
      setIsTyping(true);
      await addTypingUser.mutateAsync({ roomId });
    }

    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    const newTimeout = setTimeout(async () => {
      // Remove user from typing list and reset typing state
      setIsTyping(false);
      await removeTypingUser.mutateAsync({ roomId });
    }, TYPING_INDICATOR_DELAY);

    setTypingTimeout(newTimeout);
  };

  function getTypingMessage(typing: TypingUser[]) {
    const typingCount = typing.length;

    if (typingCount === 1 && typing[0]) {
      return `${typing[0].username} is typing`;
    } else if (typingCount === 2 && typing[0] && typing[1]) {
      return `${typing[0].username} and ${typing[1].username} are typing`;
    } else if (typingCount > 2) {
      return `${typingCount} users are typing`;
    }

    return null;
  }

  async function onSubmit(values: z.infer<typeof createMessageSchema>) {
    await createMessage.mutateAsync({ content: values.content, roomId });
    form.reset({ content: "" });
  }

  useEffect(() => {
    // Clean up the timeout when the component is unmounted
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, []);

  return (
    <div className="mb-4 flex flex-col gap-4">
      <Form {...form} data-testid="message-controller">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex w-full items-center gap-4"
        >
          <FormField
            name="content"
            control={form.control}
            render={({ field }) => (
              <FormItem className="w-full flex-grow">
                <FormControl>
                  <Input
                    type="text"
                    placeholder="send a message..."
                    className="px-4 py-6"
                    onChange={(e) => {
                      handleTyping(e);
                      field.onChange(e);
                    }}
                    value={field.value}
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
      <p
        className="h-2 animate-pulse text-xs font-semibold transition-opacity"
        style={{
          visibility: typing.length > 0 ? "visible" : "hidden",
        }}
      >
        {getTypingMessage(typing)}
      </p>
    </div>
  );
}
