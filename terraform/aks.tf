# Azure Kubernetes Service (AKS) - 개선된 버전

resource "azurerm_kubernetes_cluster" "aks" {
  name                = "${var.project_name}-aks"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  dns_prefix          = "${var.project_name}-dns"

  default_node_pool {
    name       = "default"
    node_count = 1  # 개발 환경용으로 1개 노드로 감소
    vm_size    = "Standard_B2s"
  }

  identity {
    type = "SystemAssigned"
  }

  # Key Vault Secrets Provider 애드온 활성화 (중요!)
  key_vault_secrets_provider {
    secret_rotation_enabled = true
  }

  tags = {
    environment = "development"
    project     = var.project_name
  }
}

# AKS가 ACR에서 이미지를 Pull할 수 있도록 'AcrPull' 역할 부여
resource "azurerm_role_assignment" "aks_acr_pull" {
  scope                = azurerm_container_registry.acr.id
  role_definition_name = "AcrPull"
  principal_id         = azurerm_kubernetes_cluster.aks.kubelet_identity[0].object_id
}

# Key Vault Secrets Provider의 사용자 할당 관리 ID가 Key Vault에 접근할 수 있도록 역할 부여
resource "azurerm_role_assignment" "kv_secret_user" {
  scope                = azurerm_key_vault.kv.id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = azurerm_kubernetes_cluster.aks.key_vault_secrets_provider[0].secret_identity[0].object_id

  depends_on = [azurerm_key_vault.kv]
}