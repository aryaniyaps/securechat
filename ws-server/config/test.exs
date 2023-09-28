import Config

# We don't run a server during test. If one is required,
# you can enable the server option below.
config :ws_server, WsServerWeb.Endpoint,
  http: [ip: {127, 0, 0, 1}, port: 4002],
  secret_key_base: "Jv6+gDUy/Ht9xRqNr/FPVm4LT7rfT+ciXAFgMFjpGo5d0PQZh+R9/zXTH15YIb43",
  server: false

# Print only warnings and errors during test
config :logger, level: :warning

# Initialize plugs at runtime for faster test compilation
config :phoenix, :plug_init_mode, :runtime
