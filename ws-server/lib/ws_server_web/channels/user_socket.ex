defmodule WsServerWeb.UserSocket do
  use Phoenix.Socket

  @connect_proxy_url System.get_env("CONNECT_PROXY_URL")

  # A Socket handler
  #
  # It's possible to control the websocket connection and
  # assign values that can be accessed by your channel topics.

  ## Channels

  channel "room:*", WsServerWeb.RoomChannel

  # This function is invoked when a client tries to connect to a channel.
  @impl true
  def connect(params, socket) do
    IO.puts("Socket is trying to connect...")
    cookies = socket.conn.req_headers |> List.keyfind("cookie", 0) |> elem(1)

    case authenticate_with_proxy(cookies, params) do
      {:ok, user_info} ->
        {:ok, assign(socket, :user_info, user_info)}

      {:error, _reason} ->
        :error
    end
  end

  defp authenticate_with_proxy(cookies, params) do
    headers = [{"Cookie", cookies}]
    case HTTPoison.post(@connect_proxy_url, "", headers, params: params) do
      {:ok, %HTTPoison.Response{status_code: 200, body: body}} ->
        decoded_body = Jason.decode!(body)
        if decoded_body["valid"] do
          {:ok, decoded_body["result"]}
        else
          {:error, :invalid_credentials}
        end

      {:ok, %HTTPoison.Response{status_code: _}} ->
        {:error, :unexpected_status_code}

      {:error, %HTTPoison.Error{reason: reason}} ->
        {:error, reason}
    end
  end

  # Socket id's are topics that allow you to identify all sockets for a given user:
  #
  #     def id(socket), do: "user_socket:#{socket.assigns.user_id}"
  #
  # Would allow you to broadcast a "disconnect" event and terminate
  # all active sockets and channels for a given user:
  #
  #     Elixir.WsServerWeb.Endpoint.broadcast("user_socket:#{user.id}", "disconnect", %{})
  #
  # Returning `nil` makes this socket anonymous.
  @impl true
  def id(_socket), do: nil
end
