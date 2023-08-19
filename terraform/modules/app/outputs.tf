output "job_id" {
  value = nomad_job.app.id
  description = "ID of the App Nomad job."
}
