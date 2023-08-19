output "job_id" {
  value = nomad_job.centrifugo.id
  description = "ID of the Centrifugo Nomad job."
}
