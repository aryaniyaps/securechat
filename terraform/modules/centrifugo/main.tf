data "template_file" "centrifugo_job" {
  template = file("${path.module}/centrifugo.hcl")
  
  vars = {
    centrifugo_api_key = var.centrifugo_api_key
    centrifugo_admin_password = var.centrifugo_admin_password
    centrifugo_admin_secret = var.centrifugo_admin_secret
  }
}


resource "nomad_job" "centrifugo" {
  jobspec    = data.template_file.centrifugo_job.rendered
}