log_level = "DEBUG"

api_addr = "http://${api_address}:8200"  # Use the public IP in production

ui = true

listener "tcp" {
  address     = "${bind_address}:8200"
  tls_disable = 1  # You should enable TLS in production
}

storage "consul" {
  address = "${consul_address}:8500"
  path    = "vault/"
}
