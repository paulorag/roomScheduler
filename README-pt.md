# RoomScheduler 🏢

[![Status](https://img.shields.io/badge/Status-Conclu%C3%ADdo-success)]()
[![Licença](https://img.shields.io/badge/Licen%C3%A7a-MIT-blue)]()
[![Java](https://img.shields.io/badge/Java-21-orange)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.0-green)](https://spring.io/projects/spring-boot)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)](https://www.postgresql.org/)

[Read this document in English](README.md)

**Sistema corporativo Full Stack de gestão e agendamento de salas de reunião com prevenção matemática de conflitos (Double Booking Prevention), segurança RBAC, auditoria JPA, exportação iCalendar, painel analítico de métricas e pipeline de CI/CD automatizado.**

---

## 📖 Sobre o Projeto

O **RoomScheduler** é uma solução completa voltada a eliminar problemas de sobreposição e conflitos em reservas de salas de reunião corporativas. Diferente de um CRUD tradicional, este sistema implementa uma **lógica de agendamento stateful**, impedindo conflitos diretamente no banco de dados através do algoritmo: `StartA < EndB && EndA > StartB`.

### 🌐 Links de Produção

- **Aplicação (Frontend):** [Acessar RoomScheduler (Vercel)](https://room-scheduler-gold.vercel.app/)
- **Status da API (Backend):** [Status da API (Render)](https://room-scheduler-api.onrender.com/api/rooms)
- **Health Check (Actuator):** [Endpoint de Saúde](https://room-scheduler-api.onrender.com/actuator/health)

> **⚠️ Nota sobre o Deploy (Render Free Tier):**
> A API Backend está hospedada no plano gratuito do Render. A primeira requisição após um período de inatividade pode levar até 60 segundos para inicializar o container.

---

## 🏗️ Arquitetura e Tecnologias

### Backend (API RESTful)
- **Java 21 & Spring Boot 4.0**: Núcleo desacoplado em camadas (`Controller -> Service -> Repository`) com isolamento estrito por DTOs e sem vazamento de dados sensíveis.
- **Spring Security + JWT**: Autenticação Stateless e controle de acesso baseado em papéis (**RBAC** - `USER` vs `ADMIN`), expiração calculada de forma agnóstica a fuso horário (`Instant.now()`) e suporte dedicado a preflight CORS.
- **Auditoria JPA & Hooks de Ciclo de Vida**: Registro automático de data de criação e modificação (`created_at`, `updated_at`) com `@EnableJpaAuditing` e fallbacks em `@PrePersist` / `@PreUpdate`.
- **Versionamento de Banco (Flyway Migrations)**: Migrações versionadas com índices de performance para consultas de alta frequência (`idx_bookings_room_time`, `idx_bookings_user`, `idx_users_email`).
- **Paginação Spring Data**: Endpoints com paginação eficiente via `Pageable` (`/api/bookings/page`, `/api/users/page`).
- **Spring Boot Actuator**: Endpoints corporativos de observabilidade (`/actuator/health`, `/actuator/metrics`).
- **Serviço de Notificações (`NotificationService`)**: Disparo de e-mails em eventos de criação e cancelamento com `JavaMailSender` e fallback resiliente em log.
- **Gerador iCalendar (.ics) RFC 5545**: Exportação de convites de calendário padronizados (`/api/bookings/{id}/ics`) compatíveis com Google Agenda, Apple Calendar e Microsoft Outlook.
- **Semeador Automático de Dados (`DataInitializer`)**: Inicialização automática da conta de administrador padrão (`admin@room.com`) e salas de reunião iniciais.
- **Swagger / OpenAPI 3**: Documentação interativa disponível em `/swagger-ui.html`.
- **JUnit 5 & Mockito**: Suíte completa de testes automatizados com banco em memória H2.

### Frontend (SPA/SSR)
- **Next.js 16 (App Router)** & **React 19**: Interface moderna e otimizada com divisão clara entre Server e Client Components.
- **TypeScript**: Tipagem estrita compartilhada com os DTOs do backend.
- **Next.js Edge Middleware**: Proteção de rotas no servidor e validação de permissões para `/admin` e `/my-bookings`.
- **Cliente HTTP Centralizado**: Camada tipada (`src/services/api.ts`) com tratamento uniforme de respostas e erros.
- **Grade Diária Interativa de Ocupação**: Visualização em formato de grade/timeline dos horários reservados por sala com seletor de datas na Home.
- **Painel de Analytics & Métricas de Uso**: Gráficos e indicadores de distribuição de ocupação por sala e total de horas agendadas.
- **Validação de Senha em Tempo Real**: Checklist visual dinâmico com 5 critérios de segurança, confirmação de correspondência de senha e botão para mostrar/ocultar senha.
- **Modais Customizados e Acessíveis**: Componentes de diálogo com Tailwind CSS (`ConfirmModal`) substituindo janelas nativas do navegador.
- **Exportação de Relatórios CSV**: Download instantâneo de planilhas de reservas e usuários no painel administrativo.
- **Tailwind CSS**: Estilização corporativa responsiva e moderna.

### DevOps & Infraestrutura
- **Docker Compose**: Orquestração local do PostgreSQL (porta mapeada `5434`) e container do backend.
- **GitHub Actions CI**: Pipeline automatizado que valida os 25 testes do backend e compila o frontend Next.js a cada push/pull request na branch principal.

---

## ✨ Funcionalidades Principais

### 🔒 Segurança & Controle de Acesso
- **Autenticação JWT**: Geração e validação de tokens seguros.
- **RBAC Estrito**: Permissões granulares para Administradores (`ADMIN`) e Usuários comuns (`USER`).
- **Validador de Força de Senha**: Validação dinâmica de 5 regras de segurança (mínimo de 8 caracteres, maiúsculas, minúsculas, números e caracteres especiais).
- **Guardião de Rotas no Edge**: Interceptação antes da renderização no navegador.

### 📅 Gestão de Reservas Inteligente
- **Prevenção de Sobreposição (Double Booking Prevention)**: Algoritmo que bloqueia conflitos no banco de dados.
- **Regra de SLA (24 Horas)**: Usuários comuns só podem cancelar reservas com no mínimo 24 horas de antecedência.
- **Admin Override**: Administradores podem cancelar qualquer reserva a qualquer instante.
- **Duração Mínima de 15 Minutos**: Validação no formulário do cliente e na camada de serviço.
- **Integração com Calendários**: Download direto do arquivo `.ics` para adicionar à agenda.

### ⚙️ Painel Administrativo & Métricas
- **Gestão de Espaços**: Cadastro, edição e exclusão de salas (com verificação de integridade para salas com reservas ativas).
- **Gestão de Usuários**: Listagem, promoção/rebaixamento de privilégios (`USER` / `ADMIN`) e banimento.
- **Analytics de Ocupação**: Indicadores em tempo real de distribuição de uso por sala e volume de horas reservadas.
- **Exportação de Dados**: Download de planilhas CSV com os registros de reservas e usuários cadastrados.

---

## 📚 Documentação da API (Swagger UI)

Com o backend rodando localmente, acesse a documentação interativa:
- **Swagger UI**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **OpenAPI JSON**: [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)

---

## 🚀 Como Rodar Localmente

### Pré-requisitos
- **Docker & Docker Compose**
- **Java 21 (JDK)**
- **Node.js 20+**

### Passo 1: Clonar o Repositório
```bash
git clone https://github.com/paulorag/room-scheduler.git
cd room-scheduler
```

### Passo 2: Iniciar o Banco de Dados (Docker)
```bash
docker compose up -d postgres
```
*(O PostgreSQL roda na porta mapeada `5434` para evitar conflitos de porta na máquina local)*

### Passo 3: Iniciar o Backend (Spring Boot)
```bash
cd scheduler
./mvnw spring-boot:run
```
*A API estará disponível em http://localhost:8080*

> **Credenciais do Administrador Padrão (Criado automaticamente na inicialização):**
> - **Email:** `admin@room.com`
> - **Senha:** `Admin@12345`

### Passo 4: Iniciar o Frontend (Next.js)
Em outro terminal:
```bash
cd frontend
npm install
npm run dev
```
*O Frontend estará disponível em http://localhost:3000*

### Passo 5: Executar os Testes
```bash
# Executar suíte de testes do backend (25 testes automatizados)
cd scheduler
./mvnw test

# Validar build do frontend Next.js
cd ../frontend
npm run build
```

---

## 📄 Licença

Este projeto está sob a licença **MIT** - consulte o arquivo [LICENSE](LICENSE) para mais detalhes.

Desenvolvido por Paulo Roberto A. Gomes.
