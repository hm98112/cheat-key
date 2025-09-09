# 1. 리소스 그룹 이름 출력
output "resource_group_name" {
  value = azurerm_resource_group.rg.name
}

# 2. ACR의 로그인 서버 주소를 출력
output "acr_login_server" {
  value = azurerm_container_registry.acr.login_server
}

# 3. AKS 클러스터의 이름을 출력
output "aks_cluster_name" {
  value = azurerm_kubernetes_cluster.aks.name
}

# 1. Argo CD 초기 관리자 비밀번호를 읽어오는 데이터 소스
data "kubernetes_secret" "argocd_initial_admin_secret" {
  metadata {
    name      = "argocd-initial-admin-secret"
    namespace = kubernetes_namespace.argocd.metadata[0].name
  }
  depends_on = [helm_release.argocd] # ArgoCD 설치가 끝난 후에 이 데이터를 읽어오도록 함
}

# 2. 읽어온 시크릿에서 실제 비밀번호 값을 출력
output "argocd_initial_admin_password" {
  value       = data.kubernetes_secret.argocd_initial_admin_secret.data.password
  sensitive   = true # 터미널에 실제 비밀번호가 노출되지 않도록 함
  description = "Initial admin password for Argo CD. Decode from Base64 to use."
}
# terraform output argocd_initial_admin_password 명령어로 비밀번호 확인 가능