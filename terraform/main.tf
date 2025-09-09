# 1. 사용할 Provider(플러그인) 목록 선언
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
    # 랜덤 값 생성을 위한 Provider (Key Vault 이름 중복 방지용)
    random = {
      source  = "hashicorp/random"
      version = "~> 3.1"
    }
  }
}

# 2. 각 Provider의 상세 설정 및 인증

# Azure Provider에 대한 추가 설정 (Key Vault)
provider "azurerm" {
  features {
    key_vault {
      purge_soft_delete_on_destroy    = true # Terraform으로 삭제 시 즉시 완전 삭제
      recover_soft_deleted_key_vaults = true # 삭제된 Key Vault 복구 기능 활성화
    }
  }
}

# AKS 클러스터와 통신하기 위한 Kubernetes 및 Helm Provider 설정
# Terraform 코드로 생성한 AKS 클러스터에 K8s, Helm 프로바이더가 접속할 수 있도록 인증 정보를 동적으로 가져와 설정함
# Terraform이 생성한 결과물(output)을 다른 리소스의 설정(input)으로 사용할 수 있게 함
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

provider "random" {
  # 랜덤 Provider 설정은 필요시에만 추가
}