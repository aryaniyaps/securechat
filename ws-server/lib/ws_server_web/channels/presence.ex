defmodule WsServerWeb.Presence do
  use Phoenix.Presence,
    otp_app: :ws_server,
    pubsub_server: WsServer.PubSub
end
