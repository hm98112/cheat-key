# 1. Azure Database for PostgreSQL (Flexible Server)
resource "azurerm_postgresql_flexible_server" "psql" {
  # 서버 기본 정보
  name                   = "${var.project_name}-psql-server"
  resource_group_name    = azurerm_resource_group.rg.name
  location               = azurerm_resource_group.rg.location
  version                = "13"

  # 관리자 계정 정보
  administrator_login    = "psqladmin"
  administrator_password = var.postgresql_admin_password # 변수를 통해 암호 전달

  # 서버 사양 (SKU)
  sku_name   = "B_Standard_B1ms"
  storage_mb = 32768 # 32GB 스토리지

  # 백업 설정
  backup_retention_days = 7 # 7일간 백업 보관
  geo_redundant_backup_enabled = false # 지역 중복 백업 비활성화 (비용 절감)
  
  tags = {
    environment = "development"
    project     = var.project_name
  }
}

# 2. PostgreSQL 데이터베이스 생성
resource "azurerm_postgresql_flexible_server_database" "db" {
  name      = "tetrisgamedb"
  server_id = azurerm_postgresql_flexible_server.psql.id # 위에서 만든 서버에 속하도록 지정
  collation = "en_US.utf8"
  charset   = "utf8"
}

# 방화벽 규칙 1
resource "azurerm_postgresql_flexible_server_firewall_rule" "aks_access" {
  name             = "AKSAccess"
  server_id        = azurerm_postgresql_flexible_server.psql.id
  start_ip_address = "0.0.0.0"  # 임시로 모든 IP 허용
  end_ip_address   = "255.255.255.255" # 추후에 Portal에서 범위 수정 필요
}

# 방화벽 규칙 2 - Azure 서비스에서의 접근 허용 (AKS 클러스터용)
resource "azurerm_postgresql_flexible_server_firewall_rule" "azure_services" {
  name             = "AzureServices"
  server_id        = azurerm_postgresql_flexible_server.psql.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0" # Azure 내부의 서비스의 접근을 허용하는 규칙
}

# 3. Azure Cache for Redis 생성
resource "azurerm_redis_cache" "redis" {
  # Redis 기본 정보
  name                = "${var.project_name}-redis-cache"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location

  # Redis 사양양
  capacity            = 1
  family              = "C" # 'C'는 기본/표준 티어를 의미
  sku_name            = "Basic"

  # Redis 세부 설정
  redis_configuration {
    maxmemory_reserved = 10
    maxmemory_delta    = 10
    maxmemory_policy   = "allkeys-lru" # 메모리가 꽉 차면 가장 오랫동안 사용되지 않은 키부터 삭제
  }

  # 태그 설정
  tags = {
    environment = "development"
    project     = var.project_name
  }
}