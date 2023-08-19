provider "digitalocean" {
  token = var.do_token
}

provider "nomad" {
  address = "http://${digitalocean_droplet.server.ipv4_address}:4646"
}

module "app" {
  source = "./modules/app"

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
  providers = {
    nomad = nomad
  }
}

module "caddy" {
  source   = "./modules/caddy"
  
  do_token = var.do_token
  providers = {
    nomad = nomad
  }
}

module "centrifugo" {
  source = "./modules/centrifugo"

  centrifugo_api_key = var.centrifugo_api_key
  centrifugo_admin_password = var.centrifugo_admin_password
  centrifugo_admin_secret = var.centrifugo_admin_secret
  providers = {
    nomad = nomad
  }
}

module "minio" {
  source = "./modules/minio"

  minio_access_key = var.minio_access_key
  minio_secret_key = var.minio_secret_key
  minio_default_buckets = var.minio_default_buckets
  minio_server_url = var.minio_server_url
  providers = {
    nomad = nomad
  }
}

module "mongodb" {
  source = "./modules/mongodb"

  mongo_password = var.mongo_password
  mongo_user = var.mongo_user
  mongo_replica_set_key = var.mongo_replica_set_key
  providers = {
    nomad = nomad
  }
}

data "template_file" "server_config" {
    template = file("${path.module}/server.hcl")

    vars = {
        nomad_server_bootstrap_expect = "1"
        nomad_data_dir                = "/tmp/nomad"
        nomad_bind_addr               = digitalocean_droplet.server.ipv4_address # IP of the Nomad server droplet
    }
}


resource "digitalocean_droplet" "server" {
  count    = 1
  image    = "ubuntu-20-04-x64"
  name     = "vnadi.com"
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
      "sudo apt-get update && sudo apt-get install -y nomad",
    ]
  }

  provisioner "file" {
    content     = data.template_file.server_config.rendered
    destination = "/etc/nomad.d/server.hcl"
  }

  provisioner "remote-exec" {
    inline = [
      "sudo systemctl enable nomad",
      "sudo systemctl start nomad"
    ]
  }
}
