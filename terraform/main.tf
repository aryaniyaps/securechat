provider "digitalocean" {
  token = var.do_token
}

resource "digitalocean_droplet" "web" {
  image    = "ubuntu-20-04-x64"
  name     = "web-server"
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
      "export DEBIAN_FRONTEND=noninteractive",
      "sleep 10", # add a delay to ensure no other apt processes are running
      "apt-get update",
      "apt-get install -y apt-transport-https ca-certificates curl software-properties-common",
      "curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -",
      "add-apt-repository \"deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable\"",
      "apt-get update",
      "apt-get install -y docker-ce",
      "systemctl start docker", # Start the Docker service
      "curl -L \"https://github.com/docker/compose/releases/download/v2.20.2/docker-compose-$(uname -s)-$(uname -m)\" -o /usr/local/bin/docker-compose",
      "chmod +x /usr/local/bin/docker-compose"
    ]
  }


  provisioner "file" {
    source      = "../docker-compose.yml"
    destination = "/root/docker-compose.yml"
  }

  provisioner "remote-exec" {
    inline = [
      "echo 'DIGITALOCEAN_API_TOKEN=${var.do_token}' >> /root/.env",
      "echo 'DATABASE_URL=${var.database_url}' >> /root/.env",
      "echo 'NEXTAUTH_SECRET=${var.nextauth_secret}' >> /root/.env",
      "echo 'NEXTAUTH_URL=${var.nextauth_url}' >> /root/.env",
      "echo 'NEXTAUTH_URL_INTERNAL=${var.nextauth_url_internal}' >> /root/.env",
      "echo 'GOOGLE_CLIENT_ID=${var.google_client_id}' >> /root/.env",
      "echo 'GOOGLE_CLIENT_SECRET=${var.google_client_secret}' >> /root/.env",
      "echo 'EMAIL_SERVER=${var.email_server}' >> /root/.env",
      "echo 'EMAIL_FROM=${var.email_from}' >> /root/.env",
      "echo 'MINIO_ACCESS_KEY=${var.minio_access_key}' >> /root/.env",
      "echo 'MINIO_SECRET_KEY=${var.minio_secret_key}' >> /root/.env",
      "echo 'MINIO_END_POINT=${var.minio_end_point}' >> /root/.env",
      "echo 'MINIO_PORT=${var.minio_port}' >> /root/.env",
      "echo 'MINIO_USE_SSL=${var.minio_use_ssl}' >> /root/.env",
      "echo 'MINIO_BUCKET_NAME=${var.minio_bucket_name}' >> /root/.env",
      "echo 'CENTRIFUGO_URL=${var.centrifugo_url}' >> /root/.env",
      "echo 'CENTRIFUGO_PROXY_CONNECT_ENDPOINT=${var.centrifugo_proxy_connect_endpoint}' >> /root/.env",
      "echo 'CENTRIFUGO_ALLOWED_ORIGINS=${var.centrifugo_allowed_origins}' >> /root/.env",
      "echo 'CENTRIFUGO_API_KEY=${var.centrifugo_api_key}' >> /root/.env",
      "echo 'CENTRIFUGO_ADMIN_PASSWORD=${var.centrifugo_admin_password}' >> /root/.env",
      "echo 'CENTRIFUGO_ADMIN_SECRET=${var.centrifugo_admin_secret}' >> /root/.env",
      "echo 'CENTRIFUGO_ALLOW_SUBSCRIBE_FOR_CLIENT=${var.centrifugo_allow_subscribe_for_client}' >> /root/.env",
      "echo 'MONGO_REPLICA_SET_KEY=${var.mongo_replica_set_key}' >> /root/.env",
      "echo 'MONGO_PASSWORD=${var.mongo_password}' >> /root/.env",
      "echo 'MONGO_USER=${var.mongo_user}' >> /root/.env",
      "echo 'MINIO_SERVER_URL=${var.minio_server_url}' >> /root/.env",
    ]
  }


  provisioner "remote-exec" {
    inline = [
      "cd /root",
      "docker-compose pull",
      "docker-compose up -d"
    ]
  }
}


# resource "digitalocean_floating_ip" "web_ip" {
#   region = "blr1" # Ensure the region matches the region of the droplet.
# }

# resource "digitalocean_floating_ip_assignment" "web_ip_assignment" {
#   ip_address = digitalocean_floating_ip.web_ip.ip_address
#   droplet_id = digitalocean_droplet.web.id
# }

# resource "digitalocean_domain" "vnadi" {
#   name      = "vnadi.com" # replace with your domain name
#   ip_address = digitalocean_floating_ip.web_ip.ip_address
# }

# resource "digitalocean_record" "www" {
#   domain = digitalocean_domain.vnadi.name
#   type   = "A"
#   name   = "www"
#   value  = digitalocean_floating_ip.web_ip.ip_address
#   ttl    = 3600
# }

# resource "digitalocean_record" "socket" {
#   domain = digitalocean_domain.vnadi.name
#   type   = "A"
#   name   = "socket"
#   value  = digitalocean_floating_ip.web_ip.ip_address
#   ttl    = 3600
# }

# resource "digitalocean_record" "minio" {
#   domain = digitalocean_domain.vnadi.name
#   type   = "A"
#   name   = "minio"
#   value  = digitalocean_floating_ip.web_ip.ip_address
#   ttl    = 3600
# }

