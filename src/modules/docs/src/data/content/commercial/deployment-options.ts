import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.deploymentOptions.intro" },
      { type: "heading", level: 2, titleKey: "commercial.deploymentOptions.dockerTitle", id: "docker-compose" },
      { type: "paragraph", contentKey: "commercial.deploymentOptions.dockerIntro" },
      {
            type: "code", language: "yaml", filename: "docker-compose.yml",
            code: `version: '3.8'

services:
  api:
    image: nexora/api:latest
    ports:
      - "5000:5000"
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - DatabaseSettings__Provider=PostgreSQL
      - DatabaseSettings__ConnectionString=Host=db;Database=nexora;Username=admin;Password=secret
      - BlobStorage__Provider=Local
    depends_on:
      - db
      - redis
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health/live"]
      interval: 30s
      timeout: 5s

  frontend:
    image: nexora/frontend:latest
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://api:5000

  db:
    image: postgres:16
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=nexora
      - POSTGRES_USER=admin
      - POSTGRES_PASSWORD=secret

  redis:
    image: redis:7-alpine
    volumes:
      - redisdata:/data

volumes:
  pgdata:
  redisdata:`,
      },
      { type: "heading", level: 2, titleKey: "commercial.deploymentOptions.iisTitle", id: "iis-windows" },
      {
            type: "step-guide",
            steps: [
                  { titleKey: "commercial.deploymentOptions.iis1", contentKey: "commercial.deploymentOptions.iis1Desc" },
                  { titleKey: "commercial.deploymentOptions.iis2", contentKey: "commercial.deploymentOptions.iis2Desc" },
                  { titleKey: "commercial.deploymentOptions.iis3", contentKey: "commercial.deploymentOptions.iis3Desc" },
                  { titleKey: "commercial.deploymentOptions.iis4", contentKey: "commercial.deploymentOptions.iis4Desc" },
                  { titleKey: "commercial.deploymentOptions.iis5", contentKey: "commercial.deploymentOptions.iis5Desc" },
                  { titleKey: "commercial.deploymentOptions.iis6", contentKey: "commercial.deploymentOptions.iis6Desc" },
            ],
      },
      { type: "heading", level: 2, titleKey: "commercial.deploymentOptions.k8sTitle", id: "kubernetes" },
      {
            type: "code", language: "yaml", filename: "Kubernetes Deployment Manifest",
            code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: nexora-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nexora-api
  template:
    spec:
      containers:
        - name: api
          image: nexora/api:latest
          ports:
            - containerPort: 5000
          livenessProbe:
            httpGet:
              path: /health/live
              port: 5000
          readinessProbe:
            httpGet:
              path: /health/ready
              port: 5000
          env:
            - name: DatabaseSettings__ConnectionString
              valueFrom:
                secretKeyRef:
                  name: nexora-secrets
                  key: db-connection-string`,
      },
      { type: "heading", level: 2, titleKey: "commercial.deploymentOptions.bareMetalTitle", id: "bare-metal" },
      {
            type: "code", language: "bash", filename: "Bare Metal / VM Deployment",
            code: `# Publish self-contained
dotnet publish -c Release --self-contained -r linux-x64 -o ./deploy

# Run as systemd service
sudo cp nexora.service /etc/systemd/system/
sudo systemctl enable nexora
sudo systemctl start nexora`,
      },
      { type: "heading", level: 2, titleKey: "commercial.deploymentOptions.envTitle", id: "environment-configuration" },
      {
            type: "table", headers: ["Variable", "Default", "Description"], rows: [
                  ["ASPNETCORE_ENVIRONMENT", "Development", "Production, Staging, Development"],
                  ["DatabaseSettings__Provider", "SqlServer", "SqlServer, Oracle, PostgreSQL"],
                  ["DatabaseSettings__ConnectionString", "—", "Database connection string"],
                  ["BlobStorage__Provider", "Local", "Local, Azure, S3, MinIO"],
                  ["Kestrel__Endpoints__Http__Url", "http://*:5000", "HTTP listen address"],
                  ["Redis__ConnectionString", "localhost:6379", "Redis for caching"],
            ],
      },
      { type: "heading", level: 2, titleKey: "commercial.deploymentOptions.sslTitle", id: "ssl-configuration" },
      {
            type: "table", headers: ["Approach", "Best For"], rows: [
                  ["Reverse proxy (Nginx/IIS)", "Most common — proxy terminates HTTPS"],
                  ["Kestrel direct", "Simple deployments, K8s with cert-manager"],
                  ["Cloud load balancer", "AWS ALB, Azure App Gateway — terminates at edge"],
            ],
      },
      { type: "heading", level: 2, titleKey: "commercial.deploymentOptions.checklistTitle", id: "deployment-checklist" },
      {
            type: "step-guide",
            steps: [
                  { titleKey: "commercial.deploymentOptions.check1", contentKey: "commercial.deploymentOptions.check1Desc" },
                  { titleKey: "commercial.deploymentOptions.check2", contentKey: "commercial.deploymentOptions.check2Desc" },
                  { titleKey: "commercial.deploymentOptions.check3", contentKey: "commercial.deploymentOptions.check3Desc" },
                  { titleKey: "commercial.deploymentOptions.check4", contentKey: "commercial.deploymentOptions.check4Desc" },
                  { titleKey: "commercial.deploymentOptions.check5", contentKey: "commercial.deploymentOptions.check5Desc" },
            ],
      },
];

registerPage({
      slug: "commercial/deployment-options",
      titleKey: "commercial.deploymentOptions.title",
      descriptionKey: "commercial.deploymentOptions.description",
      category: "commercial-integration",
      order: 4,
      sections,
      relatedSlugs: ["commercial/deployment-modes", "commercial/performance", "commercial/technology-stack"],
      lastUpdated: "2026-02-19",
});
