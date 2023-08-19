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
}

variable "nextauth_url_internal" {
  description = "NextAuth Internal URL"
  type        = string
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
}

variable "minio_port" {
  description = "MinIO Port"
  type        = string
}

variable "minio_use_ssl" {
  description = "MinIO Use SSL"
  type        = string
}

variable "minio_bucket_name" {
  description = "MinIO Bucket Name"
  type        = string
}

variable "centrifugo_url" {
  description = "Centrifugo URL"
  type        = string
}

variable "centrifugo_api_key" {
  description = "Centrifugo API Key"
  type        = string
  sensitive   = true
}