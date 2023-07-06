import { zodResolver } from "@hookform/resolvers/zod";
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
  const [open, setOpen] = useState(false);
  const form = useForm<z.infer<typeof createRoomSchema>>({
    resolver: zodResolver(createRoomSchema),
  });

  const createRoom = api.room.create.useMutation();

  async function onSubmit(values: z.infer<typeof createRoomSchema>) {
    await createRoom.mutateAsync({ name: values.name });
    setOpen(false); // Closes the dialog after room creation
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Create Room</Button>
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
              rules={{ required: "Room Name is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Name</FormLabel>
                  <FormControl>
                    <Input placeholder="room name" {...field} />
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
