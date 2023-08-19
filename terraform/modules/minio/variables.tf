variable "minio_access_key" {
  description = "MinIO Access Key"
  type        = string
}

variable "minio_secret_key" {
  description = "MinIO Secret Key"
  type        = string
  sensitive   = true
}

variable "minio_default_buckets" {
  description = "MinIO Default Buckets"
  type        = string
  default     = "avatars:public"
}

variable "minio_server_url" {
  description = "MinIO Server URL"
  type        = string
}