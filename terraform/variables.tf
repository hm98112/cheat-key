# 변수 정의 - 업데이트된 버전

variable "resource_group_location" {
  type        = string
  default     = "koreacentral"
  description = "Resources will be deployed in this location."
}

variable "project_name" {
  type        = string
  default     = "tetrisgame"
  description = "A unique name for the project to prefix resources."
}

variable "postgresql_admin_password" {
  type        = string
  sensitive   = true
  description = "The administrator password for the PostgreSQL server."
}

# 추가된 변수들
variable "jwt_secret" {
  type        = string
  sensitive   = true
  description = "JWT secret for token signing"
  default     = "" # terraform.tfvars에서 설정하거나 환경변수로 제공
}

variable "refresh_token_secret" {
  type        = string
  sensitive   = true
  description = "Refresh token secret for JWT refresh tokens"
  default     = "" # terraform.tfvars에서 설정하거나 환경변수로 제공
}