resource "vault_generic_secret" "mongodb" {
  path = "secret/data/mongodb"

  data_json = jsonencode({
    username        = var.mongo_user
    password        = var.mongo_password
    replica_set_key = var.mongo_replica_set_key
  })
}

resource "nomad_job" "mongodb" {
  jobspec = file("${path.module}/mongodb.hcl")
}
