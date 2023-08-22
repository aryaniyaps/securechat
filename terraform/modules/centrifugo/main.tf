resource "vault_generic_secret" "centrifugo" {
  path = "secret/data/centrifugo"

  data_json = jsonencode({
    api_key        = var.centrifugo_api_key
    admin_password = var.centrifugo_admin_password
    admin_secret   = var.centrifugo_admin_secret
  })
}


resource "nomad_job" "centrifugo" {
  jobspec = file("${path.module}/centrifugo.hcl")
}
