datacenter = "dc1"

log_level = "INFO"
data_dir = "${data_dir}"

server   = true
bootstrap_expect = ${consul_server_bootstrap_expect}

bind_addr = "${bind_address}"
advertise_addr = "${advertise_address}"

connect {
  enabled = true
}

ports {
  grpc = 8502
}