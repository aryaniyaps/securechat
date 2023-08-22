data "template_file" "minio_job" {
  template = file("${path.module}/minio.hcl")

  vars = {
    minio_access_key      = var.minio_access_key
    minio_secret_key      = var.minio_secret_key
    minio_default_buckets = var.minio_default_buckets
    minio_server_url      = var.minio_server_url
  }
}


resource "nomad_job" "minio" {
  jobspec = data.template_file.minio_job.rendered
}
