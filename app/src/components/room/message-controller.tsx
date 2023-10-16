import { zodResolver } from "@hookform/resolvers/zod";
import { type Channel } from "phoenix";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { type PresenceEntry } from "~/hooks/use-room-channel";
import { useToast } from "~/hooks/use-toast";
import { type AttachmentFile } from "~/schemas/attachment";
import { type User } from "~/schemas/user";
import { api } from "~/utils/api";
import {
  MAX_MESSAGE_ATTACHMENTS,
  TYPING_INDICATOR_DELAY,
} from "~/utils/constants";
import { Icons } from "../icons";
import { Button } from "../ui/button";
import { Form, FormControl, FormField, FormItem } from "../ui/form";
import { Input } from "../ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

const createMessageSchema = z.object({
  content: z.union([
    z
      .string()
      .min(1, { message: "Message must be at least 1 character." })
      .max(250, { message: "Message cannot exceed 250 characters." }),
    z.literal(null),
  ]),
});

interface MediaControllerProps {
  selectedFiles: File[];
  onChange: (selectedFiles: File[] | null) => void;
}

function MediaController(props: MediaControllerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      props.onChange(newFiles);
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            fileInputRef.current?.click();
          }}
        >
          <Icons.add size={20} className="h-4 w-4" />
          <input
            type="file"
            className="hidden"
            onChange={onSelectFile}
            multiple
            ref={fileInputRef}
          />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Add attachment</TooltipContent>
    </Tooltip>
  );
}

function MediaPreview({
  file,
  onDelete,
}: {
  file: File;
  onDelete: (file: File) => void;
}) {
  return (
    <div className="w-36 rounded-md bg-tertiary">
      <div className="relative flex flex-col gap-4 p-2">
        <div className="absolute right-0 top-0 z-10">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="tertiary" size="xs">
                <Icons.trash2
                  size={15}
                  className="h-4 w-4 text-destructive"
                  onClick={() => {
                    onDelete(file);
                  }}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete attachment</TooltipContent>
          </Tooltip>
        </div>
        <embed
          type={file.type}
          src={URL.createObjectURL(file)}
          title={file.name}
          height={100}
          className="rounded-md object-cover"
        />
        <p className="truncate overflow-ellipsis font-mono text-xs">
          {file.name}
        </p>
      </div>
    </div>
  );
}

function MediaPreviewer({
  selectedFiles,
  onDeleteFile,
}: {
  selectedFiles: File[];
  onDeleteFile: (file: File) => void;
}) {
  // todo: add horizontal scrollbar here
  return (
    <div className="w-full overflow-x-auto rounded-md border border-tertiary">
      <div className="flex flex-nowrap gap-4 p-4">
        {selectedFiles.map((file, index) => (
          <MediaPreview
            key={`${file.name}-${index}`}
            file={file}
            onDelete={onDeleteFile}
          />
        ))}
      </div>
    </div>
  );
}

function TypingIndicator({
  presenceInfo,
}: {
  presenceInfo: PresenceEntry[] | null;
}) {
  // Filter out users who are typing
  const typingUsers = useMemo(() => {
    if (!presenceInfo) return [];

    return Object.entries(presenceInfo)
      .filter(([_userId, userPresence]) =>
        userPresence.metas.some((meta) => meta.typing)
      )
      .map(([_userId, userPresence]) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return userPresence.metas[0]!.user_info;
      });
  }, [presenceInfo]);

  function getTypingMessage(typing: User[]) {
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

  return (
    <p
      className="h-2 animate-pulse text-xs font-semibold transition-opacity"
      style={{
        visibility: typingUsers.length > 0 ? "visible" : "hidden",
      }}
    >
      {getTypingMessage(typingUsers)}
    </p>
  );
}

export default function MessageController({
  roomId,
  presenceInfo,
  channel,
}: {
  roomId: string;
  presenceInfo: PresenceEntry[] | null;
  channel: Channel;
}) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const [isTyping, setIsTyping] = useState(false);

  const [typingTimeout, setTypingTimeout] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  const form = useForm<z.infer<typeof createMessageSchema>>({
    resolver: zodResolver(createMessageSchema),
    defaultValues: {
      content: null,
    },
  });

  const { toast } = useToast();

  const createMessage = api.message.create.useMutation({});

  const createAttachmentPresignedUrls =
    api.message.createAttachmentPresignedUrls.useMutation({});

  const onFileChange = (newFiles: File[] | null) => {
    if (!newFiles) return;

    const spaceLeft = MAX_MESSAGE_ATTACHMENTS - selectedFiles.length;

    // Check if we've already reached the max attachments
    if (spaceLeft <= 0) {
      toast({
        description: `Cannot add more than ${MAX_MESSAGE_ATTACHMENTS} files!`,
        variant: "destructive",
      });
      return;
    }

    // Determine how many new files can be added without exceeding the limit
    const filesToAdd = newFiles.slice(0, spaceLeft);
    setSelectedFiles((prevFiles) => [...prevFiles, ...filesToAdd]);

    // If we had to truncate the newFiles array, show a toast
    if (filesToAdd.length < newFiles.length) {
      toast({
        description: `Cannot add more than ${MAX_MESSAGE_ATTACHMENTS} files!`,
        variant: "destructive",
      });
    }
  };

  async function uploadAttachment(media: Blob, presignedUrl: string) {
    const response = await fetch(presignedUrl, {
      method: "PUT",
      body: media,
      headers: {
        "Content-Type": media.type,
      },
    });
    return response.ok;
  }

  function onDeleteFile(fileToRemove: File) {
    setSelectedFiles((prevFiles) =>
      prevFiles.filter((file) => file !== fileToRemove)
    );
  }

  async function onSubmit(values: z.infer<typeof createMessageSchema>) {
    try {
      let attachments: AttachmentFile[] = [];

      if (selectedFiles.length > 0) {
        const metadata = await createAttachmentPresignedUrls.mutateAsync({
          roomId: roomId,
          attachments: selectedFiles.map((attachment, index) => ({
            name: attachment.name,
            contentType: attachment.type,
            id: String(index),
          })),
        });

        const uploadPromises = metadata.map((item) => {
          const attachment = selectedFiles[Number(item.id)];

          if (!attachment) {
            toast({
              description: "Couldn't find attachment!",
              variant: "destructive",
            });
            return;
          }

          return uploadAttachment(attachment, item.presignedUrl);
        });

        // Wait for all uploads to complete.
        await Promise.all(uploadPromises);

        attachments = metadata.map((item) => item.metadata);
      }

      await createMessage.mutateAsync({
        content: values.content,
        roomId: roomId,
        ...(attachments && { attachments: attachments }),
      });
      form.reset({ content: null });
      setSelectedFiles([]);
    } catch (err) {
      toast({ description: "Couldn't send message!", variant: "destructive" });
    }
  }

  function handleTyping() {
    if (!isTyping) {
      setIsTyping(true);
      channel.push("typing", { typing: true });

      const timeout = setTimeout(stopTyping, TYPING_INDICATOR_DELAY);
      setTypingTimeout(timeout);
    } else {
      restartTypingTimeout();
    }
  }

  function stopTyping() {
    setIsTyping(false);
    channel.push("typing", { typing: false });
  }

  function restartTypingTimeout() {
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    const timeout = setTimeout(stopTyping, TYPING_INDICATOR_DELAY);
    setTypingTimeout(timeout);
  }

  useEffect(() => {
    // Cleanup: clear the timeout when the component is unmounted
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [typingTimeout]);

  return (
    <div className="mb-4 flex w-full flex-col gap-4">
      {selectedFiles.length > 0 && (
        <MediaPreviewer
          selectedFiles={selectedFiles}
          onDeleteFile={onDeleteFile}
        />
      )}

      <Form {...form} data-testid="message-controller">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex w-full items-center gap-4"
        >
          <MediaController
            selectedFiles={selectedFiles}
            onChange={onFileChange}
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
                    {...field}
                    value={field.value || ""}
                    onChange={(e) => {
                      handleTyping();
                      field.onChange(e);
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                type="submit"
                className="py-6"
                disabled={
                  form.formState.isSubmitting ||
                  (!form.getValues("content") && selectedFiles.length === 0)
                }
              >
                <Icons.send size={20} className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Send message</TooltipContent>
          </Tooltip>
        </form>
      </Form>
      <TypingIndicator presenceInfo={presenceInfo} />
    </div>
  );
}
