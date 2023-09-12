import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useCurrentRoomStore } from "~/hooks/stores/useCurrentRoomStore";
import { useToast } from "~/hooks/use-toast";
import { AttachmentFile } from "~/schemas/attachment";
import { TypingUser } from "~/schemas/typing";
import { api } from "~/utils/api";
import { TYPING_INDICATOR_DELAY } from "~/utils/constants";
import { Icons } from "../icons";
import { Button } from "../ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "../ui/form";
import { Input } from "../ui/input";

const createMessageSchema = z
  .object({
    content: z.optional(
      z.string()
        .min(1, { message: "Message must be at least 1 character." })
        .max(250, { message: "Message cannot exceed 250 characters." })
    ),
    attachments: z.nullable(z.array(z.instanceof(Blob))),
  })
  .refine(
    (data) => !!data.content || !!data.attachments,
    {
      message: "Either content or attachments must be provided.",
      path: [], // specify the root object as the point of failure
    }
  );


interface MediaControllerProps {
  selectedFiles: File[];
  onChange: (selectedFiles: File[] | null) => void;
}

function MediaController(props: MediaControllerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      props.onChange([...(props.selectedFiles || []), ...newFiles]);
    }
  };

  return (
    <Button
      type="button"
      variant="secondary"
      onClick={() => {
        fileInputRef.current?.click();
      }}
    >
      <Icons.add size={20} className="h-4 w-4" />
      <input
        name="attachments"
        type="file"
        multiple
        ref={fileInputRef}
        className="hidden"
        onChange={onSelectFile}
      />
    </Button>
  );
}


export default function MessageController({ roomId }: { roomId: string }) {
  const { typing } = useCurrentRoomStore();

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const [isTyping, setIsTyping] = useState(false);

  const form = useForm<z.infer<typeof createMessageSchema>>({
    resolver: zodResolver(createMessageSchema),
    defaultValues: {
      content: "",
      attachments: []
    },
  });

  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const { toast } = useToast()

  const createMessage = api.message.create.useMutation({});

  const addTypingUser = api.typing.addUser.useMutation({});

  const removeTypingUser = api.typing.removeUser.useMutation({});

  const createMediaPresignedUrl =
    api.message.createMediaPresignedUrl.useMutation({});


  const onFileChange = (newFiles: File[] | null) => {
    if (newFiles) {
      setSelectedFiles(prevFiles => [...prevFiles, ...newFiles]);
    }
  };

  async function uploadMedia(media: Blob, presignedUrl: string) {
    const response = await fetch(presignedUrl, {
      method: "PUT",
      body: media,
      headers: {
        "Content-Type": media.type,
      },
    });
    return response.ok;
  }


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
  // }

  async function onSubmit(values: z.infer<typeof createMessageSchema>) {
    try {

      let attachments: AttachmentFile[] = [];

      if (values.attachments) {
        for (const attachment of values.attachments) {
          let uri = null;
          const { presignedUrl, uri: generatedFileUri } =
            await createMediaPresignedUrl.mutateAsync({
              contentType: attachment.type,
              roomId: roomId
            });
          const isUploadSuccessful = await uploadMedia(
            attachment,
            presignedUrl
          );

          if (!isUploadSuccessful) {
            toast({
              description: "Couldn't upload media!",
              variant: "destructive",
            });
          } else {
            uri = generatedFileUri;
            attachments.push({ contentType: attachment.type, uri: uri, name: attachment.name });
          }

        }
      }

      const payload: any = {
        content: values.content,
        roomId: roomId
      };

      if (attachments) {
        payload.attachments = attachments;
      }

      await createMessage.mutateAsync(payload);
      form.reset({ content: "", attachments: null });
    } catch (err) {
      toast({ description: "Couldn't send message!", variant: "destructive" });
    }
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
      {selectedFiles.length > 0 && (<div className="w-full flex gap-4 p-4 bg-secondary rounded-md" >{selectedFiles.map((file, index) => {
        return (
          <div key={`${file.name}-${index}`} className="px-6 py-4 bg-tertiary rounded-md">{file.name}</div>
        )
      })}</div>)}

      <Form {...form} data-testid="message-controller">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex w-full items-center gap-4"
        >
          <FormField
            control={form.control}
            name="attachments"
            render={({ field: { ref, ...field } }) => (
              <FormItem>
                <FormControl>
                  <MediaController
                    selectedFiles={selectedFiles}
                    onChange={onFileChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
