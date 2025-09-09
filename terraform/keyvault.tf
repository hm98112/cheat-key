# Key Vault 이름 중복 방지를 위한 4자리 랜덤 문자열
resource "random_string" "kv_suffix" {
  length  = 4
  special = false
  upper   = false
}

# 현재 Terraform을 실행하는 사용자의 Azure 구성 정보 가져오기
data "azurerm_client_config" "current" {}

# -----

# Azure Key Vault 생성
resource "azurerm_key_vault" "kv" {
  # 기본 정보
  name                = "${var.project_name}-kv-${random_string.kv_suffix.result}"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  tenant_id           = data.azurerm_client_config.current.tenant_id
  sku_name            = "standard"

  # Key Vault 접근 정책 1 - Terraform을 실행하는 '나'에게 모든 권한 부여여
  access_policy {
    tenant_id = data.azurerm_client_config.current.tenant_id
    object_id = data.azurerm_client_config.current.object_id

    key_permissions = [ # 시크릿에 대한 거의 모든 권한
      "Create",
      "Get",
    ]

    secret_permissions = [
      "Set",
      "Get",
      "Delete",
      "List",
    ]

    storage_permissions = [
      "Set",
      "Get",
    ]
  }

  # Key Vault 접근 정책 2 - AKS 클러스터의 'Key Vault Provider'에게 읽기 권한만 부여
  # AKS 클러스터의 관리되는 ID가 Key Vault에 접근할 수 있도록 정책 추가
  access_policy {
    tenant_id = data.azurerm_client_config.current.tenant_id
    # AKS 애드온의 ID
    object_id = azurerm_kubernetes_cluster.aks.key_vault_secrets_provider[0].secret_identity[0].object_id

    secret_permissions = [ # 시크릿을 읽고 목록을 보는 최소한의 권한
      "Get",
      "List",
    ]
  }

  tags = {
    environment = "development"
    project     = var.project_name
  }
}

# -----

# Key Vault에 저장할 시크릿들
# PostgreSQL
resource "azurerm_key_vault_secret" "db_user" {
  name         = "db-user"
  value        = azurerm_postgresql_flexible_server.psql.administrator_login
  key_vault_id = azurerm_key_vault.kv.id

  depends_on = [azurerm_key_vault.kv]
}

resource "azurerm_key_vault_secret" "db_password" {
  name         = "db-password"
  value        = var.postgresql_admin_password
  key_vault_id = azurerm_key_vault.kv.id

  depends_on = [azurerm_key_vault.kv]
}

resource "azurerm_key_vault_secret" "db_host" {
  name         = "db-host"
  value        = azurerm_postgresql_flexible_server.psql.fqdn
  key_vault_id = azurerm_key_vault.kv.id

  depends_on = [azurerm_key_vault.kv]
}

resource "azurerm_key_vault_secret" "db_port" {
  name         = "db-port"
  value        = 5432
  key_vault_id = azurerm_key_vault.kv.id

  depends_on = [azurerm_key_vault.kv]
}

resource "azurerm_key_vault_secret" "db_database" {
  name         = "db-database"
  value        = azurerm_postgresql_flexible_server_database.db.name
  key_vault_id = azurerm_key_vault.kv.id

  depends_on = [azurerm_key_vault.kv]
}

# -----

resource "azurerm_key_vault_secret" "redis_host" {
  name         = "redis-host"
  value        = azurerm_redis_cache.redis.hostname
  key_vault_id = azurerm_key_vault.kv.id

  depends_on = [azurerm_key_vault.kv]
}

resource "azurerm_key_vault_secret" "redis_pass" {
  name         = "redis-pass"
  value        = azurerm_redis_cache.redis.primary_access_key
  key_vault_id = azurerm_key_vault.kv.id

  depends_on = [azurerm_key_vault.kv]
}

# -----

resource "azurerm_key_vault_secret" "jwt_secret" {
  name         = "jwt-secret"
  value        = var.jwt_secret
  key_vault_id = azurerm_key_vault.kv.id

  depends_on = [azurerm_key_vault.kv]
}

resource "azurerm_key_vault_secret" "refresh_token_secret" {
  name         = "refresh-token-secret"
  value        = var.refresh_token_secret
  key_vault_id = azurerm_key_vault.kv.id

  depends_on = [azurerm_key_vault.kv]
}