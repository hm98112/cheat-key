# 1. Azure Database for PostgreSQL (Flexible Server)
# 회원 정보, 게임 전적 등 영구 데이터를 저장
resource "azurerm_postgresql_flexible_server" "psql" {
  name                   = "${var.project_name}-psql-server"
  resource_group_name    = azurerm_resource_group.rg.name
  location               = azurerm_resource_group.rg.location
  version                = "13"
  administrator_login    = "psqladmin"
  administrator_password = var.postgresql_admin_password

  # ✨ 추가된 부분: 'tetrisgamedb' 라는 이름의 데이터베이스를 서버 안에 생성합니다.
  # db_charset             = "UTF8"
  # db_collation           = "en_US.utf8"

  sku_name = "B_Standard_B1ms"
  storage_mb = 32768 # 32GB

  # !!!: 개발 중에는 편의를 위해 모든 IP에서 접근을 허용
  # 실제 운영 환경에서는 AKS의 IP만 허용하도록 변경해야 한다.
  public_network_access_enabled = true
}

# 2. Azure Cache for Redis
# 실시간 랭킹, 매칭 대기열 등 빠른 데이터 처리
resource "azurerm_redis_cache" "redis" {
  name                = "${var.project_name}-redis-cache"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  capacity            = 1
  family              = "C" # C (Basic/Standard)
  sku_name            = "Basic"

  # public_network_access_enabled = false # 실제로는 Private Endpoint를 사용해 내부망 통신 권장
}
