output "job_id" {
  value = nomad_job.caddy.id
  description = "ID of the Caddy Nomad job."
}
