import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { api } from "~/utils/api";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "../ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";

const createRoomSchema = z.object({
  name: z
    .string({ required_error: "Please enter a room name." })
    .min(2, { message: "Room name must be atleast 2 characters." })
    .max(25, { message: "Room name cannot exceed 25 characters." }),
});

export function RoomController() {
  const utils = api.useContext();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const form = useForm<z.infer<typeof createRoomSchema>>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: {
      name: "",
    },
  });

  const createRoom = api.room.create.useMutation({
    async onSuccess(newRoom) {
      await utils.room.getAll.cancel();

      utils.room.getAll.setInfiniteData({ limit: 10 }, (oldData) => {
        if (oldData == null || oldData.pages[0] == null) return;
        return {
          ...oldData,
          pages: [
            {
              ...oldData.pages[0],
              items: [newRoom, ...oldData.pages[0].items],
            },
            ...oldData.pages.slice(1),
          ],
        };
      });
    },
  });

  async function onSubmit(values: z.infer<typeof createRoomSchema>) {
    const room = await createRoom.mutateAsync({ name: values.name });
    form.reset({ name: "" });
    setOpen(false); // Closes the dialog after room creation
    await router.push(`/rooms/${room.id}`);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="min-w-fit">
          Create Room
        </Button>
      </DialogTrigger>
      <DialogContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-6"
          >
            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="What should we call your room?"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="w-full"
              >
                Create room
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
