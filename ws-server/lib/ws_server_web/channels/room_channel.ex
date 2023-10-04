defmodule WsServerWeb.RoomChannel do
  use WsServerWeb, :channel
  alias WsServerWeb.Presence

  @impl true
  def join("rooms:" <> _room_id, _message, socket) do
    # TODO: check if room ID is valid here, and maybe store room data as state
    send(self(), :after_join)
    {:ok, socket}
  end

  @impl true
  def handle_info(:after_join, socket) do
    {:ok, _} =
      Presence.track(socket, socket.assigns.user_info["id"], %{
        typing: false,
        online_at: inspect(System.system_time(:second)),
        user_info: socket.assigns.user_info
      })

    push(socket, "presence_state", Presence.list(socket))
    {:noreply, socket}
  end

  @impl true
  def handle_in("typing", %{"typing" => typing}, socket) do
    {:ok, _} = Presence.update(socket, socket.assigns.user_info["id"], %{
      typing: typing,
      online_at: inspect(System.system_time(:second)),
      user_info: socket.assigns.user_info
    })
    {:reply, :ok, socket}
  end


  # Add authorization logic here as required.
  # defp authorized?(_payload) do
  #   true
  # end
end
