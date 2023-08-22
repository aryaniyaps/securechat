terraform {
  required_providers {
    nomad = {
      source  = "hashicorp/nomad"
      version = "2.0.0-rc.2"
    }
  }
  required_version = ">= 1.5.5"
}
