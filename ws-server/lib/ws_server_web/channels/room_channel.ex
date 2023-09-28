defmodule WsServerWeb.RoomChannel do
  use WsServerWeb, :channel

  @impl true
  def join("rooms:" <> _room_id, _message, socket) do
    {:ok, socket}
  end


  # Add authorization logic here as required.
  # defp authorized?(_payload) do
  #   true
  # end
end
