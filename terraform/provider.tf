terraform {
  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.0"
    }
    nomad = {
      source = "hashicorp/nomad"
      version = "1.4.14"
    }
  }
  
  required_version = ">= 0.14"
}
