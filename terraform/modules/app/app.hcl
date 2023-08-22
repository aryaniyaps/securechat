job "app" {
  datacenters = ["dc1"]

  group "app-group" {
    count = 1
  
    network {
      mode = "bridge"
      port "web" {
        static = 3000
        to     = 3000
      }
    }

    service {
      name = "app"
      tags = ["app"]
      port = "web"
      
      check {
        name     = "alive"
        type     = "tcp"
        interval = "10s"
        timeout  = "2s"
      }

      connect {
        sidecar_service {}
      }
    }

    task "app" {
      driver = "docker"

      template {
        data = <<EOH
        DATABASE_URL={{ with secret "secret/data/app" }}{{ .Data.data.database_url }}{{ end }}
        NEXTAUTH_SECRET={{ with secret "secret/data/app" }}{{ .Data.data.nextauth_secret }}{{ end }}
        NEXTAUTH_URL={{ with secret "secret/data/app" }}{{ .Data.data.nextauth_url }}{{ end }}
        NEXTAUTH_URL_INTERNAL={{ with secret "secret/data/app" }}{{ .Data.data.nextauth_url_internal }}{{ end }}
        GOOGLE_CLIENT_ID={{ with secret "secret/data/app" }}{{ .Data.data.google_client_id }}{{ end }}
        GOOGLE_CLIENT_SECRET={{ with secret "secret/data/app" }}{{ .Data.data.google_client_secret }}{{ end }}
        EMAIL_SERVER={{ with secret "secret/data/app" }}{{ .Data.data.email_server }}{{ end }}
        EMAIL_FROM={{ with secret "secret/data/app" }}{{ .Data.data.email_from }}{{ end }}
        MINIO_ACCESS_KEY={{ with secret "secret/data/app" }}{{ .Data.data.minio_access_key }}{{ end }}
        MINIO_SECRET_KEY={{ with secret "secret/data/app" }}{{ .Data.data.minio_secret_key }}{{ end }}
        MINIO_END_POINT={{ with secret "secret/data/app" }}{{ .Data.data.minio_end_point }}{{ end }}
        MINIO_PORT={{ with secret "secret/data/app" }}{{ .Data.data.minio_port }}{{ end }}
        MINIO_USE_SSL={{ with secret "secret/data/app" }}{{ .Data.data.minio_use_ssl }}{{ end }}
        MINIO_BUCKET_NAME={{ with secret "secret/data/app" }}{{ .Data.data.minio_bucket_name }}{{ end }}
        CENTRIFUGO_URL={{ with secret "secret/data/app" }}{{ .Data.data.centrifugo_url }}{{ end }}
        CENTRIFUGO_API_KEY={{ with secret "secret/data/app" }}{{ .Data.data.centrifugo_api_key }}{{ end }}
        EOH

        destination = "secrets/env"
        env = true
      }

      config {
        image = "aryaniyaps/securechat:latest"

        port_map {
          web = 3000
        }
      }

      resources {
        cpu    = 500 # Modify based on your needs
        memory = 350 # Modify based on your needs
      }
    }
  }
}
