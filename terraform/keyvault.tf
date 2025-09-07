# Azure Key Vault 생성
resource "azurerm_key_vault" "kv" {
  name                = "${var.project_name}-kv-${random_string.kv_suffix.result}"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  tenant_id           = data.azurerm_client_config.current.tenant_id
  sku_name            = "standard"

  # Key Vault 접근 정책 설정
  access_policy {
    tenant_id = data.azurerm_client_config.current.tenant_id
    object_id = data.azurerm_client_config.current.object_id

    key_permissions = [
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

  # AKS 클러스터의 관리되는 ID가 Key Vault에 접근할 수 있도록 정책 추가
  access_policy {
    tenant_id = data.azurerm_client_config.current.tenant_id
    object_id = azurerm_kubernetes_cluster.aks.key_vault_secrets_provider[0].secret_identity[0].object_id

    secret_permissions = [
      "Get",
      "List",
    ]
  }

  tags = {
    environment = "development"
    project     = var.project_name
  }
}

# Key Vault 이름 중복 방지를 위한 랜덤 문자열
resource "random_string" "kv_suffix" {
  length  = 4
  special = false
  upper   = false
}

# 현재 Azure 구성 정보 가져오기
data "azurerm_client_config" "current" {}

# Key Vault에 저장할 시크릿들
resource "azurerm_key_vault_secret" "postgresql_url" {
  name         = "postgresql-url"
  value        = "postgresql://${azurerm_postgresql_flexible_server.psql.administrator_login}:${var.postgresql_admin_password}@${azurerm_postgresql_flexible_server.psql.fqdn}:5432/${azurerm_postgresql_flexible_server_database.db.name}?sslmode=require"
  key_vault_id = azurerm_key_vault.kv.id

  depends_on = [azurerm_key_vault.kv]
}

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