# Kubernetes Add-ons (Helm) - 수정된 버전

# 1. Add-on들을 설치할 Namespace를 Kubernetes 클러스터 내에 생성
resource "kubernetes_namespace" "monitoring" {
  metadata {
    name = "monitoring"
  }
}

resource "kubernetes_namespace" "argocd" {
  metadata {
    name = "argocd"
  }
}

# 2. Prometheus & Grafana 설치 (kube-prometheus-stack Helm Chart 사용)
resource "helm_release" "prometheus_stack" {
  name       = "prometheus-stack"
  repository = "https://prometheus-community.github.io/helm-charts"
  chart      = "kube-prometheus-stack"
  namespace  = kubernetes_namespace.monitoring.metadata[0].name
  version    = "51.6.0"

  # Grafana에 외부에서 접속할 수 있도록 LoadBalancer 타입으로 설정
  set {
    name  = "grafana.service.type"
    value = "LoadBalancer"
  }

  # Prometheus에 외부에서 접속할 수 있도록 설정 (개발용)
  set {
    name  = "prometheus.service.type"
    value = "LoadBalancer"
  }

  depends_on = [kubernetes_namespace.monitoring]
}

# 3. Argo CD 설치 (argo-cd Helm Chart 사용)
resource "helm_release" "argocd" {
  name       = "argocd"
  repository = "https://argoproj.github.io/argo-helm"
  chart      = "argo-cd"
  namespace  = kubernetes_namespace.argocd.metadata[0].name
  version    = "5.51.5"

  # Argo CD UI에 외부에서 접속할 수 있도록 LoadBalancer 타입으로 서비스 설정
  set {
    name  = "server.service.type"
    value = "LoadBalancer"
  }

  # Argo CD 서버의 보안 설정 (개발용)
  set {
    name  = "server.extraArgs[0]"
    value = "--insecure"
  }

  depends_on = [kubernetes_namespace.argocd]
}