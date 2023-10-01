defmodule WsServerWeb.UserSocket do
  use Phoenix.Socket

  @token_verify_url System.get_env("TOKEN_VERIFY_URL")

  # A Socket handler
  #
  # It's possible to control the websocket connection and
  # assign values that can be accessed by your channel topics.

  ## Channels

  channel "rooms:*", WsServerWeb.RoomChannel

  # This function is invoked when a client tries to connect to a channel.
  @impl true
  def connect(params, socket) do
    case authenticate_connection(params["token"]) do
      {:ok, user_info} ->
        {:ok, assign(socket, :user_info, user_info)}

      {:error, reason} ->
        {:error, reason}
    end
  end

  defp authenticate_connection(gateway_token) do
    # Convert the Elixir map to a JSON string
    body = Jason.encode!(%{token: gateway_token})

    headers = [{"Content-Type", "application/json"}]

    # Make a HTTP Request to the Proxy URL
    case HTTPoison.post(@token_verify_url, body, headers) do
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
  def id(socket), do: "user_socket:#{socket.assigns.user_info["id"]}"
end
