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

  host_volume "caddy" {
    path      = "/var/lib/caddy"
    read_only = false
  }
  
  host_volume "minio" {
    path      = "/var/lib/minio"
    read_only = false
  }
  
  host_volume "mongodb" {
    path      = "/var/lib/mongodb"
    read_only = false
  }
}

consul {
  address = "${consul_address}:8500"
}