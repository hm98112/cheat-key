# 1. GitHub Actions CI/CD 워크플로우가 사용할 전용 사용자 할당 관리 ID 생성
resource "azurerm_user_assigned_identity" "cicd_identity" {
  name                = "${var.project_name}-cicd-identity"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
}

# 2. 위에서 만든 관리 ID와 GitHub Actions 저장소를 연결하는 '페더레이션 자격 증명' 생성 (핵심!)
resource "azurerm_federated_identity_credential" "github_actions_credential" {
  name                = "github-actions-federation"
  resource_group_name = azurerm_resource_group.rg.name
  parent_id           = azurerm_user_assigned_identity.cicd_identity.id
  audience            = ["api://AzureADTokenExchange"]
  issuer              = "https://token.actions.githubusercontent.com"
  
  # subject: 어떤 GitHub 저장소의 어떤 브랜치/환경을 신뢰할지 지정합니다.
  subject             = "repo:hm98112/cheat-key:ref:refs/heads/main" 
}

# 3. 이 관리 ID가 Key Vault에서 비밀을 읽을 수 있도록 역할 할당
resource "azurerm_role_assignment" "cicd_kv_secrets_user" {
  scope                = azurerm_key_vault.kv.id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = azurerm_user_assigned_identity.cicd_identity.principal_id
}
