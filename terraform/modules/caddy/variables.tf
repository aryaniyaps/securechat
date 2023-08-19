variable "do_token" {
  description = "DigitalOcean API token"
  type        = string
  sensitive   = true
}

variable "acme_email" {
  description = "Email address to use for the ACME account managing the site certificates"
  type        = string
}
