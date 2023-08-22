resource "vault_generic_secret" "minio" {
  path = "secret/data/minio"

  data_json = jsonencode({
    access_key      = var.minio_access_key
    secret_key      = var.minio_secret_key
    default_buckets = var.minio_default_buckets
    server_url      = var.minio_server_url
  })
}

resource "nomad_job" "minio" {
  jobspec = file("${path.module}/minio.hcl")
}
