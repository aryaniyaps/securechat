output "job_id" {
  value = nomad_job.mongodb.id
  description = "ID of the MongoDB Nomad job."
}
