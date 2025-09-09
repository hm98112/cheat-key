output "resource_group_name" {
  value = azurerm_resource_group.rg.name
}

output "acr_login_server" {
  value = azurerm_container_registry.acr.login_server
}

output "aks_cluster_name" {
  value = azurerm_kubernetes_cluster.aks.name
}

# Argo CD 초기 관리자 비밀번호를 가져오기 위한 데이터 소스
data "kubernetes_secret" "argocd_initial_admin_secret" {
  metadata {
    name      = "argocd-initial-admin-secret"
    namespace = kubernetes_namespace.argocd.metadata[0].name
  }
  depends_on = [helm_release.argocd]
}

output "argocd_initial_admin_password" {
  value       = data.kubernetes_secret.argocd_initial_admin_secret.data.password
  sensitive   = true
  description = "Initial admin password for Argo CD. Decode from Base64 to use."
}
