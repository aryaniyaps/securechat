provider "digitalocean" {
  token = var.do_token
}

provider "nomad" {
  address = "http://${digitalocean_droplet.server.ipv4_address}:4646"
}

module "app" {
  source = "./modules/app"

  database_url          = var.database_url
  nextauth_secret       = var.nextauth_secret
  nextauth_url          = var.nextauth_url
  nextauth_url_internal = var.nextauth_url_internal
  google_client_id      = var.google_client_id
  google_client_secret  = var.google_client_secret
  email_server          = var.email_server
  email_from            = var.email_from
  minio_access_key      = var.minio_access_key
  minio_secret_key      = var.minio_secret_key
  minio_end_point       = var.minio_end_point
  minio_port            = var.minio_port
  minio_use_ssl         = var.minio_use_ssl
  minio_bucket_name     = var.minio_bucket_name
  centrifugo_url        = var.centrifugo_url
  centrifugo_api_key    = var.centrifugo_api_key
  providers = {
    nomad = nomad
  }
}

module "caddy" {
  source = "./modules/caddy"

  do_token   = var.do_token
  acme_email = var.acme_email
  providers = {
    nomad = nomad
  }
}

module "centrifugo" {
  source = "./modules/centrifugo"

  centrifugo_api_key        = var.centrifugo_api_key
  centrifugo_admin_password = var.centrifugo_admin_password
  centrifugo_admin_secret   = var.centrifugo_admin_secret
  providers = {
    nomad = nomad
  }
}

module "minio" {
  source = "./modules/minio"

  minio_access_key      = var.minio_access_key
  minio_secret_key      = var.minio_secret_key
  minio_default_buckets = var.minio_default_buckets
  minio_server_url      = var.minio_server_url
  providers = {
    nomad = nomad
  }
}

module "mongodb" {
  source = "./modules/mongodb"

  mongo_password        = var.mongo_password
  mongo_user            = var.mongo_user
  mongo_replica_set_key = var.mongo_replica_set_key
  providers = {
    nomad = nomad
  }
}


resource "digitalocean_droplet" "server" {
  image    = "ubuntu-20-04-x64"
  name     = "vnadi.com"
  region   = "blr1"
  size     = "s-1vcpu-2gb"
  ssh_keys = [var.ssh_fingerprint]

  connection {
    type        = "ssh"
    user        = "root"
    private_key = file(var.pvt_key)
    host        = self.ipv4_address
  }

  provisioner "remote-exec" {
    inline = [
      "export DEBIAN_FRONTEND=noninteractive",
      "sleep 20", // wait 20 seconds
      // Setup Docker
      "sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common",
      "curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -",
      "UBUNTU_VERSION=$(lsb_release -cs) && echo \"deb [arch=amd64] https://download.docker.com/linux/ubuntu $UBUNTU_VERSION stable\" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null",
      "sudo flock /var/lib/apt/lists/lock apt-get update",
      "sudo flock /var/lib/apt/lists/lock apt-get install -y docker-ce docker-ce-cli containerd.io",

      // Create directory for CNI plugins if it doesn't exist
      "sudo mkdir -p /opt/cni/bin",

      // Download CNI plugins
      "curl -L -o cni-plugins.tgz 'https://github.com/containernetworking/plugins/releases/download/v1.3.0/cni-plugins-linux-amd64-v1.3.0.tgz'",

      // Extract CNI plugins to the directory
      "sudo tar -xvf cni-plugins.tgz -C /opt/cni/bin",

      // Optionally, remove the downloaded tar file
      "rm cni-plugins.tgz",

      // Setup Nomad and Consul
      "wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg",
      "echo \"deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main\" | sudo tee /etc/apt/sources.list.d/hashicorp.list",
      "sudo flock /var/lib/apt/lists/lock apt-get update",
      "sudo flock /var/lib/apt/lists/lock apt-get install -y nomad consul",

      // Create Host Volume Directories,
      "sudo mkdir -p /var/lib/mongodb",
      "sudo mkdir -p /var/lib/caddy",
      "sudo mkdir -p /var/lib/minio",
    ]
  }

  provisioner "file" {
    content = templatefile(
      "${path.module}/config/nomad.hcl",
      {
        nomad_server_bootstrap_expect = "1"
        data_dir                      = "/var/lib/nomad"
        bind_address                  = "0.0.0.0" # IP of the server droplet
        consul_address                = "127.0.0.1"
      }
    )
    destination = "/etc/nomad.d/config.hcl"
  }

  provisioner "file" {
    content = templatefile(
      "${path.module}/config/consul.hcl",
      {
        data_dir                       = "/var/consul"
        consul_server_bootstrap_expect = "1"
        bind_address                   = "0.0.0.0"
        advertise_address              = self.ipv4_address # IP of the server droplet
      }
    )
    destination = "/etc/consul.d/config.hcl"
  }

  provisioner "remote-exec" {
    inline = [
      "sudo systemctl start docker",
      "sudo systemctl enable docker",
      "sudo systemctl enable consul",
      "sudo systemctl start consul",
      "sudo systemctl enable nomad",
      "sudo systemctl start nomad"
    ]
  }
}

