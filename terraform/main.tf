terraform {
  required_providers {
    # Azure 리소스를 관리하기 위한 Provider
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
    # Kubernetes 클러스터 내부 리소스를 관리하기 위한 Provider
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
    # Kubernetes 클러스터에 Helm Chart를 설치하기 위한 Provider
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.0"
    }
  }
}

# Azure Provider에 대한 추가 설정
provider "azurerm" {
  features {}
}

# AKS 클러스터와 통신하기 위한 Kubernetes 및 Helm Provider 설정
# 이 Provider들은 AKS 클러스터가 생성된 후에 인증 정보를 받아 동작
# 다른 파일(aks.tf)에 있는 'azurerm_kubernetes_cluster.aks' 리소스의 결과값을 참조
provider "kubernetes" {
  host                   = azurerm_kubernetes_cluster.aks.kube_config.0.host
  client_certificate     = base64decode(azurerm_kubernetes_cluster.aks.kube_config.0.client_certificate)
  client_key             = base64decode(azurerm_kubernetes_cluster.aks.kube_config.0.client_key)
  cluster_ca_certificate = base64decode(azurerm_kubernetes_cluster.aks.kube_config.0.cluster_ca_certificate)
}

provider "helm" {
  kubernetes {
    host                   = azurerm_kubernetes_cluster.aks.kube_config.0.host
    client_certificate     = base64decode(azurerm_kubernetes_cluster.aks.kube_config.0.client_certificate)
    client_key             = base64decode(azurerm_kubernetes_cluster.aks.kube_config.0.client_key)
    cluster_ca_certificate = base64decode(azurerm_kubernetes_cluster.aks.kube_config.0.cluster_ca_certificate)
  }
}

