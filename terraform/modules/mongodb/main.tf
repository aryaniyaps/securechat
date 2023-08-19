data "template_file" "mongodb_job" {
  template = file("${path.module}/mongodb.hcl")
  
  vars = {
    mongo_password = var.mongo_password
    mongo_user = var.mongo_user
    mongo_replica_set_key = var.mongo_replica_set_key
  }
}

resource "nomad_job" "mongodb" {
  jobspec    = data.template_file.mongodb_job.rendered
}