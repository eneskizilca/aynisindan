<div align="center">

<img width="220" alt="AYNISINDAN-LOGO" src="https://github.com/user-attachments/assets/35b32498-b728-4ed9-8e65-3e1e47c236d3" />

# Aynısından isteyenlerin yeri!
### *Geleneksel el sanatlarının ve usta zanaatkârların güvenli pazar yeri platformu.*

<p align="center">
  <img src="https://img.shields.io/badge/Spring_Boot-3.2-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" alt="Spring Boot" />
  <img src="https://img.shields.io/badge/Go_Golang-1.22-00ADD8?style=for-the-badge&logo=go&logoColor=white" alt="Golang" />
  <img src="https://img.shields.io/badge/Next.js-16.2-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React_Native-Expo-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React Native" />
  <br/>
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/Terraform-IaC-844FBA?style=for-the-badge&logo=terraform&logoColor=white" alt="Terraform" />
  <img src="https://img.shields.io/badge/AWS-EC2%20%7C%20RDS%20%7C%20S3-FF9900?style=for-the-badge&logo=amazonwebservices&logoColor=white" alt="AWS" />
  <img src="https://img.shields.io/badge/Prometheus-Grafana-E6522C?style=for-the-badge&logo=prometheus&logoColor=white" alt="Monitoring" />
</p>

---

**Aynısından**, özel tasarım el emeği ürün yaptırmak isteyen müşteriler ile geleneksel sanatları yaşatan zanaatkârları (ahşap ustaları, seramikçiler, demirciler vb.) bir araya getiren modern bir pazar yeridir. Platform, **Param-Güvende** (escrow) ödeme garantisi, yapay zeka destekli eskiz geliştirme ve anlık mesajlaşma altyapılarını entegre ederek hem alıcı hem de satıcı için üst düzey bir güven sunar.

</div>

---

## 🏛️ Sistem Mimarisi ve Teknolojiler

Aynısından, yüksek performans, bağımsız ölçeklenebilirlik ve gözlemlenebilirlik odaklı **Mikroservis Mimarisi** ile tasarlanmıştır:

```mermaid
graph TD
    %% Clients
    Web[Next.js Web App] --> Gateway[API Mappings]
    Mobile[React Native App] --> Gateway

    %% Backend Services
    Gateway -->|Core REST API| SpringBoot[Spring Boot Core Service]
    Gateway -->|WebSockets & Catalog| GoService[Go Chat & Catalog Service]

    %% Databases
    SpringBoot -->|Relational Data| PostgreSQL[(PostgreSQL)]
    GoService -->|NoSQL / Chat Logs| MongoDB[(MongoDB)]

    %% Cloud Storage
    SpringBoot -->|Sketch Uploads| AWSS3[AWS S3 Bucket]

    %% Monitoring
    Prometheus[Prometheus Scraper] -->|Fetch Metrics| SpringBoot
    Prometheus -->|Fetch Metrics| GoService
    Grafana[Grafana Dashboard] -->|Visualize| Prometheus
```

### ☕ 1. Core API Service (Java / Spring Boot)
*   **Görev:** Üyelik işlemleri, teklif yönetimi, sipariş durumları, Param-Güvende escrow ödeme iş akışları, iade ve değerlendirme süreçleri.
*   **Veritabanı:** PostgreSQL (İlişkisel ve finansal tutarlılık gerektiren veriler).
*   **Depolama:** AWS S3 (Müşteri eskizleri ve ürün fotoğrafları).
*   **Metrikler:** Micrometer + Prometheus Actuator.

### 🐹 2. Chat & Catalog Service (Go / Golang)
*   **Görev:** Gerçek zamanlı (WebSocket tabanlı) chat/mesajlaşma sistemi, portfolyo yönetimi ve zanaatkâr tamamlanan işler katalog akışı.
*   **Veritabanı:** MongoDB (Mesaj günlükleri ve esnek doküman yapısı gerektiren katalog verileri).
*   **Metrikler:** Prometheus Go Client Library.

### 🌐 3. Web Application (React / Next.js)
*   **Görev:** Müşteri ve Zanaatkâr panelleri, sipariş/teklif takibi, eskiz yükleme ve gerçek zamanlı sohbet arayüzleri.
*   **Stil:** Vanilla CSS & Tailwind.

### 📱 4. Mobile Application (React Native)
*   **Görev:** Zanaatkârların mobil cihazlardan anlık mesaj alabilmesi, teklif gönderebilmesi ve müşterilerin sipariş takibini mobil uygulamadan yapabilmesi.
*   **Altyapı:** Expo + TypeScript.

---

## 📂 Klasör Yapısı

```
aynisindan-workspace/
├── apps/
│   ├── web/                    # Next.js Web Uygulaması
│   └── mobile/                 # React Native (Expo) Mobil Uygulaması
├── services/
│   ├── core-service/           # Spring Boot (Java) Ana API Servisi
│   └── chat-catalog-service/   # Go (Golang) Mesajlaşma & Portfolyo Servisi
├── infrastructure/
│   ├── terraform/              # AWS IaC (VPC, EC2, RDS, S3, ECR) Kodları
│   ├── prometheus/             # Prometheus Scraper Yapılandırması
│   └── grafana/                # Grafana auto-provisioned Dashboards & Datasources
├── deploy.sh                   # Tek Tıkla Canlıya Dağıtım (Deploy) Scripti
├── docker-compose.yml          # Lokal Geliştirme (Full Stack) Compose Dosyası
└── docker-compose.prod.yml     # Sunucu (AWS) Üretim Ortamı Compose Dosyası
```

---

## 🛠️ Kurulum ve Lokal Çalıştırma

Tüm sistemi bilgisayarında hızlıca ayağa kaldırmak için Docker ve Docker Compose'un kurulu olması yeterlidir.

### 1. Ortam Değişkenleri
Kök dizinde bir `.env` dosyası oluşturun ve gerekli değişkenleri tanımlayın:
```env
AWS_ACCESS_KEY=your_aws_key
AWS_SECRET_KEY=your_aws_secret
AWS_S3_BUCKET=your_s3_bucket_name
AWS_REGION=eu-central-1
GEMINI_API_KEY_ENV=your_gemini_api_key
```

### 2. Tek Komutla Çalıştırma
Tüm veri tabanlarını, mikroservisleri, frontend'i ve izleme araçlarını başlatmak için:
```bash
make up
# veya
docker compose up --build
```

### 3. Erişim Noktaları (Lokal)
*   **Next.js Frontend:** [http://localhost:3000](http://localhost:3000)
*   **Spring Boot Backend:** [http://localhost:8080](http://localhost:8080)
*   **Go Chat & Catalog Service:** [http://localhost:8081](http://localhost:8081)
*   **Grafana Dashboard:** [http://localhost:3001](http://localhost:3001) (admin / admin)
*   **Prometheus Targets:** [http://localhost:9090](http://localhost:9090)

---

## 📊 İzleme ve Gözlemlenebilirlik (Observability)

Sistemde çalışan tüm servislerin performansı Prometheus tarafından kazınır ve Grafana üzerinde görselleştirilir.

*   **JVM Bellek Durumu (Heap/Non-Heap)**, GC çalışma sıklığı.
*   **Go Goroutine Sayıları** ve aktif WebSocket bağlantısı analizi.
*   **API Yanıt Süreleri (Percentiles - p50, p90, p99)**.
*   **HTTP 5xx Hata Oranları**.

*Aynısıdan Platform Metrics* panosu Grafana'da otomatik olarak yüklü gelir.

---

## ☁️ AWS Altyapısı ve Terraform (IaC)

Aynısından altyapısı AWS üzerinde tamamen kodla yönetilir (`infrastructure/terraform`):

*   **VPC:** İzole 2 adet Public, 2 adet Private Subnet.
*   **RDS PostgreSQL:** Sadece EC2 sunucusundan erişilebilen izole private database.
*   **Amazon S3:** Eskizlerin saklandığı güvenli obje deposu.
*   **Amazon ECR:** Mikroservislerin derlenmiş Docker imaj depoları.
*   **EC2:** Docker ve Docker Compose ile tüm stack'i koşturan sanal sunucu.

### Altyapıyı Kurmak İçin:
```bash
cd infrastructure/terraform
terraform init
terraform apply
```

---

## 🚀 Canlıya Dağıtım (Deployment)

Lokalde yaptığın kod değişikliklerini canlı sunucuya (`18.192.48.116`) tek komutla göndermek için hazırlanan otomasyon scriptini kullanabilirsin:

```bash
./deploy.sh
```
*Bu script; lokalinde linux/amd64 imajını derler, ECR'a push'lar, sunucudaki konfigürasyonları günceller ve kesintisiz (zero-downtime'a yakın) şekilde yayına alır.*

---

<div align="center">
  <p>💎 Aynısından isteyenlerin, işi ustasına bırakanların ortak adresi.</p>
</div>
