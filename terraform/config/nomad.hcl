datacenter = "dc1"

data_dir  = "${data_dir}"
bind_addr = "${bind_address}"

log_level = "DEBUG"

server {
    enabled = true
    bootstrap_expect = ${nomad_server_bootstrap_expect}
}

client {
    enabled = true
}

consul {
  address = "${consul_address}:8500"
}

// vault {
//   enabled = true
//   address = "http://vault.service.consul:8200"
//   token   = "<Nomad Server Vault Token>"
// }