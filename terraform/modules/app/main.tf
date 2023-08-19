data "template_file" "app_job" {
  template = file("${path.module}/app.hcl")
  
  vars = {
    database_url              = var.database_url
    nextauth_secret           = var.nextauth_secret
    nextauth_url              = var.nextauth_url
    nextauth_url_internal     = var.nextauth_url_internal
    google_client_id          = var.google_client_id
    google_client_secret      = var.google_client_secret
    email_server              = var.email_server
    email_from                = var.email_from
    minio_access_key          = var.minio_access_key
    minio_secret_key          = var.minio_secret_key
    minio_end_point           = var.minio_end_point
    minio_port                = var.minio_port
    minio_use_ssl             = var.minio_use_ssl
    minio_bucket_name         = var.minio_bucket_name
    centrifugo_url            = var.centrifugo_url
    centrifugo_api_key        = var.centrifugo_api_key
  }
}

resource "nomad_job" "app" {
  jobspec    = data.template_file.app_job.rendered
  depends_on = [module.mongodb.job_id, module.minio.job_id, module.centrifugo.job_id]
}