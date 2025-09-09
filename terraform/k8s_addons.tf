# Kubernetes Add-ons (Helm)

# 1. Add-on들을 설치할 Namespace를 Kubernetes 클러스터 내에 생성
# 1-1. "monitoring" 네임스페이스 생성 - for Grafana, Prometheus
resource "kubernetes_namespace" "monitoring" {
  metadata {
    name = "monitoring"
  }
}

# 1-2. "argocd" 네임스페이스 생성 - for ArgoCD
resource "kubernetes_namespace" "argocd" {
  metadata {
    name = "argocd"
  }
}

# 2. Prometheus & Grafana 설치 (kube-prometheus-stack Helm Chart 사용)
resource "helm_release" "prometheus_stack" {
  name       = "prometheus-stack"
  repository = "https://prometheus-community.github.io/helm-charts" # 차트 저장소 주소
  chart      = "kube-prometheus-stack"                               # 설치할 차트 이름
  namespace  = kubernetes_namespace.monitoring.metadata[0].name      # "monitoring" 네임스페이스에 설치
  version    = "51.6.0"                                              # 설치할 차트 버전

  # Grafana에 외부에서 접속할 수 있도록 LoadBalancer 타입으로 설정
  set {
    name  = "grafana.service.type"
    value = "LoadBalancer"
  }
  # Prometheus 대시보드에 외부에서 접속할 수 있도록 설정
  set {
    name  = "prometheus.service.type"
    value = "LoadBalancer"
  }

  depends_on = [kubernetes_namespace.monitoring] # monitoring 네임스페이스가 먼저 생성된 후 실행
}

# 3. Argo CD 설치 (argo-cd Helm Chart 사용)
resource "helm_release" "argocd" {
  name       = "argocd"
  repository = "https://argoproj.github.io/argo-helm" # Argo CD 차트 저장소 주소
  chart      = "argo-cd"                               # 설치할 차트 이름
  namespace  = kubernetes_namespace.argocd.metadata[0].name  # "argocd" 네임스페이스에 설치
  version    = "5.51.5"                                  # 설치할 차트 버전

  # Argo CD UI에 외부에서 접속할 수 있도록 LoadBalancer 타입으로 서비스 설정
  set {
    name  = "server.service.type"
    value = "LoadBalancer"
  }

  # Argo CD 서버를 HTTP로 접속 허용
  set {
    name  = "server.extraArgs[0]"
    value = "--insecure"
  }

  depends_on = [kubernetes_namespace.argocd] # argocd 네임스페이스가 먼저 생성된 후 실행
}