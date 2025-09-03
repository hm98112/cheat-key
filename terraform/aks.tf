# Azure Kubernetes Service (AKS)

resource "azurerm_kubernetes_cluster" "aks" {
  name                = "${var.project_name}-aks"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  dns_prefix          = "${var.project_name}-dns"

  default_node_pool {
    name       = "default"
    node_count = 2 # 개발용으로 2개의 노드(서버)로 시작
    vm_size    = "Standard_B2s"
  }

  identity {
    type = "SystemAssigned" # AKS가 다른 Azure 리소스에 접근할 수 있도록 자동 생성된 ID 사용
  }
}

# 권한 설정
# AKS가 ACR에서 이미지를 Pull할 수 있도록 'AcrPull' 역할을 부여
resource "azurerm_role_assignment" "aks_acr_pull" {
  scope                = azurerm_container_registry.acr.id
  role_definition_name = "AcrPull"
  principal_id         = azurerm_kubernetes_cluster.aks.kubelet_identity[0].object_id
}