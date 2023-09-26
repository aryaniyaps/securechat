defmodule WsServerWeb.RoomChannel do
  use WsServerWeb, :channel

  @impl true
  def join("rooms:" <> room_id, _message, socket) do
    {:ok, socket}
  end


  @impl true
  def handle_in("create-message", payload, socket) do
    broadcast(socket, "create-message", payload)
    {:noreply, socket}
  end

  @impl true
  def handle_in("update-message", payload, socket) do
    broadcast(socket, "update-message", payload)
    {:noreply, socket}
  end

  @impl true
  def handle_in("delete-message", payload, socket) do
    broadcast(socket, "delete-message", payload)
    {:noreply, socket}
  end


  # Add authorization logic here as required.
  defp authorized?(_payload) do
    true
  end
end
