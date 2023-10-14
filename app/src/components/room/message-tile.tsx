import { zodResolver } from "@hookform/resolvers/zod";
import { type AttachmentFile } from "@prisma/client";
import { type Session } from "next-auth";
import { useMemo, useState, type HTMLProps } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { type Message } from "~/schemas/message";
import { api } from "~/utils/api";
import { getAvatarUrl } from "~/utils/avatar";
import { getMediaUrl } from "~/utils/media";
import { Icons } from "../icons";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Form, FormControl, FormField, FormItem } from "../ui/form";
import { Skeleton } from "../ui/skeleton";
import { Textarea } from "../ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

function MessageAttachmentsViewer({
  attachments,
}: {
  attachments: AttachmentFile[];
}) {
  return (
    <div className="flex flex-col gap-4">
      {attachments.map((attachment) => {
        return (
          <embed
            key={attachment.uri}
            src={getMediaUrl(attachment.uri)}
            type={attachment.contentType}
            title={attachment.name}
            className="h-auto max-w-[200px] rounded-md object-fill"
          />
        );
      })}
    </div>
  );
}

const updateMessageSchema = z.object({
  content: z.optional(
    z
      .string()
      .min(1, { message: "Message must be at least 1 character." })
      .max(250, { message: "Message cannot exceed 250 characters." })
  ),
});

interface MessageTileProps extends HTMLProps<HTMLDivElement> {
  message: Message;
  session: Session;
  isEditing: boolean;
  setEditingMessageId: (id: string | null) => void;
}

export function MessageTile({
  message,
  session,
  isEditing,
  setEditingMessageId,
  ...props
}: MessageTileProps) {
  const [showControls, setShowControls] = useState(false);

  const form = useForm<z.infer<typeof updateMessageSchema>>({
    resolver: zodResolver(updateMessageSchema),
    defaultValues: {
      content: message.content || undefined,
    },
  });

  const canShowControls = useMemo(() => {
    return !isEditing && showControls && message.ownerId === session.user.id;
  }, [showControls, isEditing, message.ownerId, session.user.id]);

  const deleteMessage = api.message.delete.useMutation({});

  const updateMessage = api.message.update.useMutation({});

  async function onSubmit(values: z.infer<typeof updateMessageSchema>) {
    // update message here
    await updateMessage.mutateAsync({
      id: message.id,
      content: values.content,
    });
    setEditingMessageId(null);
  }

  return (
    <div
      className="flex h-full w-full gap-4 px-2 py-4 hover:bg-secondary/60"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      {...props}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={getAvatarUrl(message.owner.image, message.owner.username)}
              loading="eager"
              alt={message.owner.name || message.owner.username}
            />
            <AvatarFallback>
              {(message.owner.name || message.owner.username).slice(0, 2)}
            </AvatarFallback>
          </Avatar>
        </TooltipTrigger>
        <div className="flex w-full flex-col gap-2">
          <div className="flex gap-2">
            <TooltipTrigger asChild>
              <h3 className="text-xs font-semibold text-primary hover:cursor-default">
                {message.owner.username}
              </h3>
            </TooltipTrigger>
            <TooltipContent side="right">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={getAvatarUrl(
                      message.owner.image,
                      message.owner.username
                    )}
                    loading="eager"
                    alt={message.owner.name || message.owner.username}
                  />
                  <AvatarFallback>
                    {(message.owner.name || message.owner.username).slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                {message.owner.name ? (
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold">{message.owner.name}</h4>
                    <p className="text-sm font-semibold">
                      @{message.owner.username}
                    </p>
                    <p className="text-xs font-thin">
                      Joined on{" "}
                      {new Date(message.owner.createdAt).toLocaleString(
                        undefined,
                        {
                          day: "numeric",
                          month: "2-digit",
                          year: "2-digit",
                        }
                      )}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">
                      @{message.owner.username}
                    </h4>
                    <p className="text-xs font-thin">
                      Joined on{" "}
                      {new Date(message.owner.createdAt).toLocaleString(
                        undefined,
                        {
                          day: "numeric",
                          month: "2-digit",
                          year: "2-digit",
                        }
                      )}
                    </p>
                  </div>
                )}
              </div>
            </TooltipContent>
            <p className="text-xs font-thin">
              {new Date(message.createdAt).toLocaleString(undefined, {
                month: "2-digit",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </p>

            {canShowControls && (
              <div className="ml-2 flex gap-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Icons.penBox
                        size={5}
                        className="h-4 w-4"
                        onClick={() => {
                          setEditingMessageId(message.id);
                        }}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Edit message</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={deleteMessage.isLoading}
                    >
                      <Icons.trash2
                        size={5}
                        className="h-4 w-4 text-destructive"
                        onClick={async () => {
                          await deleteMessage.mutateAsync({ id: message.id });
                        }}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete message</TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-4 pr-4">
            {isEditing ? (
              <>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex w-full flex-col items-start gap-4"
                  >
                    <FormField
                      name="content"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem className="w-full flex-grow">
                          <FormControl>
                            <Textarea className="max-h-52 p-4" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <div className="flex gap-4">
                      <Button
                        variant="secondary"
                        type="submit"
                        className="py-6"
                        size="xs"
                        disabled={
                          form.formState.isSubmitting ||
                          !form.formState.isDirty ||
                          !form.formState.isValid
                        }
                      >
                        Save changes
                      </Button>
                      <Button
                        variant="link"
                        type="button"
                        className="py-6"
                        size="xs"
                        onClick={() => {
                          setEditingMessageId(null);
                        }}
                        disabled={form.formState.isSubmitting}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              </>
            ) : (
              <>
                {message.content && (
                  <div className="flex items-center">
                    <p className="whitespace-normal break-all">
                      {message.content}
                    </p>
                    {message.isEdited && (
                      <p className="ml-1 text-xs font-thin">(edited)</p>
                    )}
                  </div>
                )}
              </>
            )}
            {message.attachments.length > 0 && (
              <MessageAttachmentsViewer attachments={message.attachments} />
            )}
          </div>
        </div>
      </Tooltip>
    </div>
  );
}

export function MessageTileSkeleton() {
  return (
    <div className="relative flex w-[350px] gap-4 px-2 py-4">
      <Avatar className="h-8 w-8">
        <Skeleton className="h-full w-full" />
      </Avatar>
      <div className="flex w-full flex-col justify-start gap-2">
        <div className="flex w-full gap-2">
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-1/6" />
        </div>
        {/* message content */}
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  );
}
