# 변수 정의

# 리소스가 생성될 Azure 지역
variable "resource_group_location" {
  type        = string
  default     = "koreacentral"
  description = "Resources will be deployed in this location."
}

# 모든 리소스 이름 앞에 붙을 프로젝트 이름
variable "project_name" {
  type        = string
  default     = "tetris"
  description = "A unique name for the project to prefix resources."
}

# PostgreSQL 서버의 관리자 비밀번호
variable "postgresql_admin_password" {
  type        = string
  sensitive   = true # 민감 정보로 처리. (sensitive value)로 표시됨
  description = "The administrator password for the PostgreSQL server."
  # default로 되어 있지 않음. 무조건 terraform.tfvars에서 값을 입력해 줘야 함
}

# JWT 토큰 서명에 사용될 시크릿 키
variable "jwt_secret" {
  type        = string
  sensitive   = true
  description = "JWT secret for token signing"
  default     = "" # terraform.tfvars에서 설정
}

# JWT 리프레시 토큰에 사용될 시크릿 키
variable "refresh_token_secret" {
  type        = string
  sensitive   = true
  description = "Refresh token secret for JWT refresh tokens"
  default     = "" # terraform.tfvars에서 설정
}