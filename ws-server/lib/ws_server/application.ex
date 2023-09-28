defmodule WsServer.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      # Start the Telemetry supervisor
      WsServerWeb.Telemetry,
      # Start the PubSub system
      {Phoenix.PubSub, name: WsServer.PubSub},
      # Start the Endpoint (http/https)
      WsServerWeb.Endpoint,
      # Start a worker by calling: WsServer.Worker.start_link(arg)
      # {WsServer.Worker, arg},
      WsServerWeb.RabbitMQConsumer
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: WsServer.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    WsServerWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
