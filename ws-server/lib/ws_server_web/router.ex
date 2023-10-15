defmodule WsServerWeb.Router do
  use WsServerWeb, :router

  # pipeline :api do
  #   plug :accepts, ["json"]
  # end

  scope "/", WsServerWeb do
    get "/health", HealthController, :index
  end
end
