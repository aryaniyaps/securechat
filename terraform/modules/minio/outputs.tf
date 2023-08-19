output "job_id" {
  value = nomad_job.minio.id
  description = "ID of the MinIO Nomad job."
}
