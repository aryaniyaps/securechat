variable "database_url" {
  description = "Database URL"
  type        = string
  sensitive   = true
}

variable "nextauth_secret" {
  description = "NextAuth Secret"
  type        = string
  sensitive   = true
}

variable "nextauth_url" {
  description = "NextAuth URL"
  type        = string
  default     = "https://vnadi.com"
}

variable "nextauth_url_internal" {
  description = "NextAuth Internal URL"
  type        = string
  default     = "http://app:3000"
}

variable "google_client_id" {
  description = "Google Client ID"
  type        = string
}

variable "google_client_secret" {
  description = "Google Client Secret"
  type        = string
  sensitive   = true
}

variable "email_server" {
  description = "Email Server"
  type        = string
  sensitive   = true
}

variable "email_from" {
  description = "Email From"
  type        = string
  default     = "noreply@vnadi.com"
}

variable "minio_access_key" {
  description = "MinIO Access Key"
  type        = string
}

variable "minio_secret_key" {
  description = "MinIO Secret Key"
  type        = string
  sensitive   = true
}

variable "minio_end_point" {
  description = "MinIO Endpoint"
  type        = string
  default     = "minio"
}

variable "minio_port" {
  description = "MinIO Port"
  type        = string
  default     = "9000"
}

variable "minio_use_ssl" {
  description = "MinIO Use SSL"
  type        = string
  default     = "false"
}

variable "minio_bucket_name" {
  description = "MinIO Bucket Name"
  type        = string
  default     = "avatars"
}

variable "centrifugo_url" {
  description = "Centrifugo URL"
  type        = string
  default     = "http://centrifugo:8000/api"
}

variable "centrifugo_api_key" {
  description = "Centrifugo API Key"
  type        = string
  sensitive   = true
}