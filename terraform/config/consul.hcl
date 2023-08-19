log_level = "INFO"
data_dir = "${data_dir}"
server   = true
ui       = true
bind_addr = "${bind_address}"
advertise_addr = "${advertise_address}"
bootstrap_expect = ${consul_server_bootstrap_expect}

ports {
  dns = 8600 # this is the default, but it's good to be explicit
}

dns_config {
  allow_stale = true
  max_stale = "72h"
  service_ttl = {
    "*" = "30s"
  }
}