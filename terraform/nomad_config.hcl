data_dir  = "${nomad_data_dir}"
bind_addr = "${nomad_bind_addr}"

server {
    enabled = true
    bootstrap_expect = ${nomad_server_bootstrap_expect}
}

client {
    enabled = true
}

consul {
  address = "${consul_address}:8500"

  # Enable automatic syncing of Consul services with Nomad
  auto_advertise = true

  # Directs the client to use the servers for reads and not the local Consul agent
  server_service_name = "nomad"
  client_service_name = "nomad-client"
}
