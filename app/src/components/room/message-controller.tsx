import { zodResolver } from "@hookform/resolvers/zod";
import { ChangeEvent, RefObject, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useCurrentRoomStore } from "~/hooks/stores/useCurrentRoomStore";
import { useToast } from "~/hooks/use-toast";
import { TypingUser } from "~/schemas/typing";
import { api } from "~/utils/api";
import { TYPING_INDICATOR_DELAY } from "~/utils/constants";
import { Icons } from "../icons";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Form, FormControl, FormField, FormItem } from "../ui/form";
import { Input } from "../ui/input";

const createMessageSchema = z.object({
  content: z
    .string({ required_error: "Please enter a message." })
    .min(1, { message: "Message must be at least 1 character." })
    .max(250, { message: "Message cannot exceed 250 characters." }), // Updated max limit
});

function UploadMediaButton({
  showModal,
  setShowModal,
  fileInputRef,
  onUpload,
}: {
  showModal: boolean;
  setShowModal: (state: boolean) => void;
  fileInputRef: RefObject<HTMLInputElement>;
  onUpload: () => void;
}) {
  return (
    <Dialog open={showModal} onOpenChange={() => setShowModal(false)}>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          onClick={() => {
            fileInputRef.current?.click();
          }}
        >
          <Icons.add size={20} className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload attachment</DialogTitle>
          <DialogDescription>Send videos, photos and more!</DialogDescription>
        </DialogHeader>
        <Button type="submit" onClick={onUpload}>
          send message
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export default function MessageController({ roomId }: { roomId: string }) {
  const { typing } = useCurrentRoomStore();

  const [isTyping, setIsTyping] = useState(false);

  const { toast } = useToast();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [showModal, setShowModal] = useState(false);

  const fileInputRef = useRef(null);

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

  const createMediaPresignedUrl =
    api.message.createMediaPresignedUrl.useMutation({});

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setShowModal(true);
    }
  };

  async function uploadMedia(media: File, presignedUrl: string) {
    const response = await fetch(presignedUrl, {
      method: "PUT",
      body: media,
      headers: {
        "Content-Type": media.type,
      },
    });
    return response.ok;
  }

  const handleFileUpload = async () => {
    // TODO: Implement your file upload logic here
    // E.g., await uploadFileMutation.mutateAsync({ file: selectedFile, roomId });
    if (selectedFile) {
      const { presignedUrl, fileName: generatedFileName } =
        await createMediaPresignedUrl.mutateAsync({
          contentType: selectedFile.type,
          roomId: roomId,
        });

      const isUploadSuccessful = await uploadMedia(selectedFile, presignedUrl);

      if (!isUploadSuccessful) {
        toast({
          description: "Couldn't upload media!",
          variant: "destructive",
        });
      } else {
        await createMessage.mutateAsync({
          // TODO: get content as description from modal and pass it here
          content: "",
          roomId: roomId,
          media: generatedFileName,
        });
      }

      setSelectedFile(null);
    }
    setShowModal(false);
  };

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
    await createMessage.mutateAsync({
      content: values.content,
      roomId,
      media: null,
    });
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
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileInput}
          />

          <UploadMediaButton
            showModal={showModal}
            setShowModal={setShowModal}
            fileInputRef={fileInputRef}
            onUpload={handleFileUpload}
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
