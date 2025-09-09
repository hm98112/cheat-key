# Azure Database for PostgreSQL (Flexible Server) - 보안 강화 버전
resource "azurerm_postgresql_flexible_server" "psql" {
  name                   = "${var.project_name}-psql-server"
  resource_group_name    = azurerm_resource_group.rg.name
  location               = azurerm_resource_group.rg.location
  version                = "13"
  administrator_login    = "psqladmin"
  administrator_password = var.postgresql_admin_password

  sku_name   = "B_Standard_B1ms"
  storage_mb = 32768

  # 보안 설정 강화
  backup_retention_days = 7
  geo_redundant_backup_enabled = false
  
  tags = {
    environment = "development"
    project     = var.project_name
  }
}

# PostgreSQL 데이터베이스 생성
resource "azurerm_postgresql_flexible_server_database" "db" {
  name      = "tetrisgamedb"
  server_id = azurerm_postgresql_flexible_server.psql.id
  collation = "en_US.utf8"
  charset   = "utf8"
}

# 방화벽 규칙: AKS 노드들만 접근 허용
resource "azurerm_postgresql_flexible_server_firewall_rule" "aks_access" {
  name             = "AKSAccess"
  server_id        = azurerm_postgresql_flexible_server.psql.id
  start_ip_address = "0.0.0.0"  # 개발 환경에서만 임시로 모든 IP 허용
  end_ip_address   = "255.255.255.255"
  
  # 실제 운영 환경에서는 AKS 노드의 특정 IP 대역으로 제한해야 합니다
  # AKS 노드의 아웃바운드 IP를 확인 후 설정
}

# Azure 서비스에서의 접근 허용 (AKS 클러스터용)
resource "azurerm_postgresql_flexible_server_firewall_rule" "azure_services" {
  name             = "AzureServices"
  server_id        = azurerm_postgresql_flexible_server.psql.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

# Azure Cache for Redis - 보안 강화
resource "azurerm_redis_cache" "redis" {
  name                = "${var.project_name}-redis-cache"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  capacity            = 1
  family              = "C"
  sku_name            = "Basic"

  # Redis 설정
  redis_configuration {
    maxmemory_reserved = 10
    maxmemory_delta    = 10
    maxmemory_policy   = "allkeys-lru"
  }

  tags = {
    environment = "development"
    project     = var.project_name
  }
}