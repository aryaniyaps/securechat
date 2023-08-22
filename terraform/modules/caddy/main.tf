resource "vault_generic_secret" "caddy" {
  path = "secret/data/caddy"

  data_json = jsonencode({
    do_token   = var.do_token
    acme_email = var.acme_email
  })
}


resource "nomad_job" "caddy" {
  jobspec = file("${path.module}/caddy.hcl")
}
