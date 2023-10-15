defmodule WsServerWeb.HealthController do
  use WsServerWeb, :controller

  def index(conn, _params) do
    send_resp(conn, 200, "OK")
  end
end
