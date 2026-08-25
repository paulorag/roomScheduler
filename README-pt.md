# RoomScheduler 🏢

[![Status](https://img.shields.io/badge/Status-Conclu%C3%ADdo-success)]()
[![Licença](https://img.shields.io/badge/Licen%C3%A7a-MIT-blue)]()
[![Java](https://img.shields.io/badge/Java-21-orange)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3%2F4-green)](https://spring.io/projects/spring-boot)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)](https://www.postgresql.org/)

[Read this document in English](README.md)

**Sistema corporativo Full Stack de gestão e agendamento de salas de reunião com prevenção matemática de conflitos (Double Booking Prevention), segurança RBAC e pipeline de CI automatizado.**

---

## 📖 Sobre o Projeto

O **RoomScheduler** é uma solução completa para resolver o problema de sobreposição e conflitos em reservas de salas de reunião corporativas. Diferente de um CRUD tradicional, este sistema implementa uma **lógica de agendamento stateful**, impedindo conflitos diretamente no banco de dados através do algoritmo: `StartA < EndB && EndA > StartB`.

### 🌐 Links de Produção

- **Aplicação (Frontend):** [Acessar RoomScheduler (Vercel)](https://room-scheduler-gold.vercel.app/)
- **Status da API (Backend):** [Status da API (Render)](https://room-scheduler-api.onrender.com/api/rooms)

> **⚠️ Nota sobre o Deploy (Render Free Tier):**
> A API Backend está hospedada no plano gratuito do Render. A primeira requisição após inatividade pode levar até 60 segundos para inicializar.

---

## 🏗️ Arquitetura e Tecnologias

### Backend (API RESTful)
- **Java 21 & Spring Boot**: Núcleo desacoplado em camadas (`Controller -> Service -> Repository`) com isolamento por DTOs.
- **Spring Security + JWT**: Autenticação Stateless e controle de acesso baseado em papéis (**RBAC** - `USER` vs `ADMIN`).
- **Flyway Migrations**: Versionamento de schema de banco de dados com índices de performance (`idx_bookings_room_time`, `idx_bookings_user`).
- **Swagger / OpenAPI 3**: Documentação interativa disponível em `/swagger-ui.html`.
- **Spring Data JPA & Hibernate**: Validação de entidades e queries otimizadas contra PostgreSQL.
- **JUnit 5 & Mockito**: Suíte de testes com banco H2 em memória.

### Frontend (SPA/SSR)
- **Next.js 16 (App Router)** & **React 19**: Interface moderna com Server e Client Components.
- **TypeScript**: Tipagem estrita alinhada com as entidades e respostas do backend.
- **Next.js Edge Middleware**: Proteção de rotas e validação de permissões nas rotas `/admin` e `/my-bookings`.
- **Cliente HTTP Centralizado**: Camada tipada (`src/services/api.ts`) com tratamento uniforme de erros.
- **Tailwind CSS**: Estilização responsiva e tema corporativo limpo.

### DevOps & Infraestrutura
- **Docker Compose**: Orquestração do PostgreSQL (porta `5434`) e container do backend.
- **GitHub Actions CI**: Pipeline automatizado que executa os testes do backend e o build do Next.js a cada push/pull request.

---

## ✨ Funcionalidades Principais

### 🔒 Segurança & Controle de Acesso
- **Autenticação JWT**: Geração e validação de tokens seguros.
- **RBAC Estrito**: Diferenciação entre usuários comuns (`USER`) e administradores (`ADMIN`).
- **Middleware no Edge**: Bloqueio de acesso no servidor antes da renderização da página.

### 📅 Gestão de Reservas Inteligente
- **Double Booking Prevention**: Algoritmo de verificação de sobreposição no banco de dados.
- **Regra de SLA (24h)**: Cancelamento permitido apenas com no mínimo 24 horas de antecedência para usuários padrão.
- **Admin Override**: Administradores têm permissão para cancelar qualquer reserva a qualquer momento.
- **Duração Mínima de 15 Minutos**: Validação no formulário e no backend.

### ⚙️ Painel Administrativo
- **Gestão de Espaços**: Cadastro, edição e exclusão de salas (com proteção contra exclusão de salas com reservas ativas).
- **Gestão de Usuários**: Listagem, alteração de privilégios (`USER`/`ADMIN`) e banimento.
- **Busca e Filtros em Tempo Real**: Filtragem ágil de salas, usuários e reservas.

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
# Testes do backend
cd scheduler
./mvnw test

# Verificação do build do frontend
cd ../frontend
npm run build
```

---

Desenvolvido por Paulo Roberto A. Gomes.
