data_dir  = "${data_dir}"
bind_addr = "${bind_address}"

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
}