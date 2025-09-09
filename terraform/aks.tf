# Azure Kubernetes Service (AKS)

resource "azurerm_kubernetes_cluster" "aks" {
  # 클러스터 기본 정보
  name                = "${var.project_name}-aks"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  dns_prefix          = "${var.project_name}-dns"

  # 기본 노드 풀 설정
  default_node_pool {
    name       = "default"
    node_count = 1  # 노드 1개만 사용
    vm_size    = "Standard_B2s"
  }
  # 관리 ID 설정
  identity {
    type = "SystemAssigned" # Azure가 자동으로 관리 ID를 생성하고 할당
  }

  # Key Vault Secrets Provider 애드온 활성화 (중요!)
  # AKS 클러스터 내의 애플리케이션(Pod)이 Key Vault에 저장된 시크릿을 마운트하여 사용할 수 있게 함
  key_vault_secrets_provider {
    secret_rotation_enabled = true # Key Vault의 비밀 정보가 변경되면 자동으로 동기화
  }

  # 태그 설정
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
  scope                = azurerm_key_vault.kv.id # 권한을 부여할 대상: Key Vault
  role_definition_name = "Key Vault Secrets User" # 부여할 역할: 비밀 정보를 읽을 수 있는 권한
  principal_id         = azurerm_kubernetes_cluster.aks.key_vault_secrets_provider[0].secret_identity[0].object_id # 권한을 받을 주체: Key Vault Provider 애드온의 관리 ID

  depends_on = [azurerm_key_vault.kv]
}