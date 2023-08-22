job "mongodb" {
  datacenters = ["dc1"]

  group "mongo-group" {
    count = 1

    network {
      mode = "bridge"
      port "db" {
        static = 27017
        to     = 27017
      }
    }

    service {
      name = "mongodb"
      tags = ["mongodb"]
      port = "db"

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

    task "mongodb" {
      driver = "docker"

      template {
        data = <<EOH
        MONGODB_ROOT_PASSWORD={{ with secret "secret/data/mongodb" }}{{ .Data.data.password }}{{ end }}
        MONGODB_ROOT_USER={{ with secret "secret/data/mongodb" }}{{ .Data.data.username }}{{ end }}
        MONGODB_REPLICA_SET_KEY={{ with secret "secret/data/mongodb" }}{{ .Data.data.replica_set_key }}{{ end }}
        EOH

        destination = "secrets/env"
        env = true
      }

      config {
        image = "bitnami/mongodb:6.0"

        port_map {
          db = 27017
        }

        volumes = [
          "mongodb_data:/bitnami/mongodb"
        ]
      }

      env {
        MONGODB_REPLICA_SET_MODE = "primary"
        MONGODB_ADVERTISED_HOSTNAME = "mongodb.service.consul"
      }

      resources {
        cpu    = 500 # Modify based on your needs
        memory = 300 # Modify based on your needs
      }
    }

    volume "mongodb_data" {
      type      = "host"
      read_only = false
      source    = "mongodb_data"
    }
  }
}
