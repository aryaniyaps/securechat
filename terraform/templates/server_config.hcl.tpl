data_dir  = "${nomad_data_dir}"

server {
    enabled = true
    bootstrap_expect = ${nomad_server_bootstrap_expect}
    bind_addr = "${nomad_bind_addr}"
}
