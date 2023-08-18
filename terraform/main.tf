provider "digitalocean" {
  token = var.do_token
}

provider "nomad" {
  address = "http://${digitalocean_droplet.nomad_server.ipv4_address}:4646"
}

resource "nomad_job" "caddy" {
  jobspec = file("${path.root}/nomad/jobs/caddy.hcl")
  depends_on = [nomad_job.app, nomad_job.minio, nomad_job.centrifugo]
}

resource "nomad_job" "mongodb" {
  jobspec    = file("${path.root}/nomad/jobs/mongodb.hcl")
}

resource "nomad_job" "minio" {
  jobspec    = file("${path.root}/nomad/jobs/minio.hcl")
}

resource "nomad_job" "centrifugo" {
  jobspec    = file("${path.root}/nomad/jobs/centrifugo.hcl")
}

resource "nomad_job" "app" {
  jobspec    = file("${path.root}/nomad/jobs/app.hcl")
  depends_on = [nomad_job.mongodb, nomad_job.minio, nomad_job.centrifugo]
}

data "template_file" "nomad_server_config" {
    template = file("${path.module}/templates/server_config.hcl.tpl")

    vars = {
        nomad_server_bootstrap_expect = "1"
        nomad_data_dir                = "/tmp/nomad"
        nomad_bind_addr               = digitalocean_droplet.nomad_server.ipv4_address # IP of the Nomad server droplet
    }
}


resource "digitalocean_droplet" "nomad_server" {
  count    = 1
  image    = "ubuntu-20-04-x64"
  name     = "nomad-server-${count.index}"
  region   = "blr1"
  size     = "s-1vcpu-1gb"
  ssh_keys = [var.ssh_fingerprint]
  
  connection {
    type        = "ssh"
    user        = "root"
    private_key = file(var.pvt_key)
    host        = self.ipv4_address
  }

  provisioner "remote-exec" {
    inline = [
      "curl -fsSL https://apt.releases.hashicorp.com/gpg | sudo apt-key add -",
      "sudo apt-add-repository \"deb [arch=amd64] https://apt.releases.hashicorp.com $(lsb_release -cs) main\"",
      "sudo apt-get update && sudo apt-get install -y nomad"
    ]
  }

  provisioner "file" {
    content     = data.template_file.nomad_server_config.rendered
    destination = "/etc/nomad.d/server.hcl"
  }

  provisioner "remote-exec" {
    inline = [
      "sudo systemctl enable nomad",
      "sudo systemctl start nomad"
    ]
  }
}
