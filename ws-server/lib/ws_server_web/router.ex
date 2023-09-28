defmodule WsServerWeb.Router do
  use WsServerWeb, :router

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/api", WsServerWeb do
    pipe_through :api
  end
end
