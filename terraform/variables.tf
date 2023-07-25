variable "do_token" {
  description = "Your DigitalOcean API token"
  type        = string
  sensitive   = true
}

variable "ssh_fingerprint" {
  description = "Your SSH key fingerprint"
  type        = string
}

variable "pvt_key" {
  description = "Path to your private SSH key"
  type        = string
  sensitive   = true
}
