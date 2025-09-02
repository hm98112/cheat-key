# 변수 정의 (비밀번호 등등)

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
