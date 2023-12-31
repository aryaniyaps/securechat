provider "digitalocean" {
  token = var.do_token
}

resource "digitalocean_droplet" "web" {
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
    source      = "../compose.yaml"
    destination = "/root/compose.yaml"
  }

  provisioner "remote-exec" {
    inline = [
      "echo 'DIGITALOCEAN_API_TOKEN=${var.do_token}' >> /root/.env",
      "echo 'ACME_EMAIL=${var.acme_email}' >> /root/.env",
      "echo 'DATABASE_URL=${var.database_url}' >> /root/.env",
      "echo 'NEXTAUTH_SECRET=${var.nextauth_secret}' >> /root/.env",
      "echo 'NEXTAUTH_URL=${var.nextauth_url}' >> /root/.env",
      "echo 'NEXTAUTH_URL_INTERNAL=${var.nextauth_url_internal}' >> /root/.env",
      "echo 'GOOGLE_CLIENT_ID=${var.google_client_id}' >> /root/.env",
      "echo 'GOOGLE_CLIENT_SECRET=${var.google_client_secret}' >> /root/.env",
      "echo 'EMAIL_SERVER=${var.email_server}' >> /root/.env",
      "echo 'EMAIL_FROM=${var.email_from}' >> /root/.env",
      "echo 'S3_ACCESS_KEY=${var.s3_access_key}' >> /root/.env",
      "echo 'S3_SECRET_KEY=${var.s3_secret_key}' >> /root/.env",
      "echo 'S3_END_POINT=${var.s3_end_point}' >> /root/.env",
      "echo 'S3_REGION=${var.s3_region}' >> /root/.env",
      "echo 'S3_AVATAR_BUCKET_NAME=${var.s3_avatar_bucket_name}' >> /root/.env",
      "echo 'S3_MEDIA_BUCKET_NAME=${var.s3_media_bucket_name}' >> /root/.env",
      "echo 'RABBITMQ_URL=${var.rabbitmq_url}' >> /root/.env",
      "echo 'RABBITMQ_QUEUE_NAME=${var.rabbitmq_queue_name}' >> /root/.env",
      "echo 'RABBITMQ_USERNAME=${var.rabbitmq_username}' >> /root/.env",
      "echo 'RABBITMQ_PASSWORD=${var.rabbitmq_password}' >> /root/.env",
      "echo 'MONGO_REPLICA_SET_KEY=${var.mongo_replica_set_key}' >> /root/.env",
      "echo 'MONGO_PASSWORD=${var.mongo_password}' >> /root/.env",
      "echo 'MONGO_USER=${var.mongo_user}' >> /root/.env",
      "echo 'TOKEN_VERIFY_URL=${var.token_verify_url}' >> /root/.env",
      "echo 'PHX_HOST=${var.phx_host}' >> /root/.env"
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
