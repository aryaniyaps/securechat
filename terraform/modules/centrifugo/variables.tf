variable "centrifugo_api_key" {
  description = "Centrifugo API Key"
  type        = string
  sensitive   = true
}

variable "centrifugo_admin_password" {
  description = "Centrifugo Admin Password"
  type        = string
  sensitive   = true
}

variable "centrifugo_admin_secret" {
  description = "Centrifugo Admin Secret"
  type        = string
  sensitive   = true
}