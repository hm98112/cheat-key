# Kubernetes Add-ons (Helm) - 모니터링(Prometheus & Grafana), GitOps(ArgoCD)

# 1. Add-on들을 설치할 Namespace(폴더)를 Kubernetes 클러스터 내에 생성
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
# 클러스터의 상태와 애플리케이션의 메트릭을 수집하고 시각화
resource "helm_release" "prometheus_stack" {
  name       = "prometheus-stack"
  repository = "https://prometheus-community.github.io/helm-charts"
  chart      = "kube-prometheus-stack"
  namespace  = kubernetes_namespace.monitoring.metadata[0].name
  version    = "51.6.0"

  depends_on = [kubernetes_namespace.monitoring]
}

# 3. Argo CD 설치 (argo-cd Helm Chart 사용)
resource "helm_release" "argocd" {
  name       = "argocd"
  repository = "https://argoproj.github.io/argo-helm"
  chart      = "argo-cd"
  namespace  = kubernetes_namespace.argocd.metadata[0].name
  version    = "5.51.5"

  # Argo CD UI에 외부에서 접속할 수 있도록 LoadBalancer 타입으로 서비스를 설정
  set {
    name  = "server.service.type"
    value = "LoadBalancer"
  }

  depends_on = [kubernetes_namespace.argocd]
}
