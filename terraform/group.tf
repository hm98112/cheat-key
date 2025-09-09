# 리소스 그룹 정의
resource "azurerm_resource_group" "rg" {
  name     = "${var.project_name}-rg"
  location = var.resource_group_location
}