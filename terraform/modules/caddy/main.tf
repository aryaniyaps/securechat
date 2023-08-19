data "template_file" "caddy_job" {
  template = file("${path.module}/caddy.hcl")

  vars = {
    do_token = var.do_token
  }
}


resource "nomad_job" "caddy" {
  jobspec = data.template_file.caddy_job.rendered
}
