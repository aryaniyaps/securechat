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
      "apt-get update",
      "apt-get install -y apt-transport-https ca-certificates curl software-properties-common",
      "curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -",
      "add-apt-repository \"deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable\"",
      "apt-get update",
      "apt-get install -y docker-ce",
      "curl -L \"https://github.com/docker/compose/releases/download/v2.20.2/docker-compose-$(uname -s)-$(uname -m)\" -o /usr/local/bin/docker-compose",
      "chmod +x /usr/local/bin/docker-compose"
    ]
  }

  provisioner "file" {
    source      = "../docker-compose.yml"
    destination = "/root/docker-compose.yml"
  }

  provisioner "file" {
    source      = "../Caddyfile"
    destination = "/root/Caddyfile"
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
      "echo 'PUSHER_APP_ID=${var.pusher_app_id}' >> /root/.env",
      "echo 'PUSHER_APP_KEY=${var.pusher_app_key}' >> /root/.env",
      "echo 'PUSHER_CLUSTER=${var.pusher_cluster}' >> /root/.env",
      "echo 'PUSHER_SECRET=${var.pusher_secret}' >> /root/.env",
      "echo 'PUSHER_USE_TLS=${var.pusher_use_tls}' >> /root/.env",
      "echo 'PUSHER_HOST=${var.pusher_host}' >> /root/.env",
      "echo 'PUSHER_PORT=${var.pusher_port}' >> /root/.env",
      "echo 'POSTGRES_USER=${var.postgres_user}' >> /root/.env",
      "echo 'POSTGRES_DB=${var.postgres_db}' >> /root/.env",
      "echo 'POSTGRES_PASSWORD=${var.postgres_password}' >> /root/.env",
      "echo 'PUSHER_SCHEME=${var.pusher_scheme}' >> /root/.env",
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


resource "null_resource" "run_db_migrate" {
  depends_on = [digitalocean_droplet.web]

  connection {
    type        = "ssh"
    user        = "root"
    private_key = file(var.pvt_key)
    host        = digitalocean_droplet.web.ipv4_address
  }

  provisioner "remote-exec" {
    inline = [
      "docker exec -it app npm install",
      "docker exec -it app npm run db:migrate",
      "docker exec -it app rm -rf node_modules"
    ]
  }
}
