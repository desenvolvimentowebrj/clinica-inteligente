# 🏥 Sistema de Atendimento Inteligente para Clínicas Médicas

Este projeto é uma aplicação web desenvolvida com **Vue.js** no frontend e **Node.js + Express** no backend, com integração a APIs externas e autenticação JWT. Ele permite que clínicas médicas gerenciem o agendamento de consultas de forma segura, automatizada e eficiente.

---

## 📋 Funcionalidades

- Cadastro e login seguro de usuários (pacientes e secretários)
- Agendamento de consultas com verificação de horários disponíveis
- Consulta automática de endereço via CEP (ViaCEP)
- Integração com API de clima (OpenWeatherMap) para alerta de chuva
- Painel administrativo para secretários com gerenciamento de atendimentos
- Controle de acesso por tipo de usuário
- Interface responsiva e intuitiva

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- Vue.js
- Vue Router
- Axios

### Backend
- Node.js
- Express
- MongoDB + Mongoose
- JWT (JSON Web Token)
- dotenv

### APIs externas
- [ViaCEP](https://viacep.com.br/)
- [OpenWeatherMap](https://openweathermap.org/)

---

## 🚀 Como Executar o Projeto Localmente

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/seu-repositorio.git
cd seu-repositorio


### 2. Instale as dependências
Backend

cd backend
npm install

Frontend

cd frontend
npm install


### 3. Configure o ambiente

Crie um arquivo .env na pasta backend com base no .env.example. Exemplo:

PORT=5000
JWT_SECRET=segredo123
OPENWEATHER_API_KEY=sua_api_key_aqui
DATABASE_URL=mongodb://localhost:27017/clinica


⚠️ O arquivo .env não está incluído por segurança. Use o .env.example como referência.


### 4. Inicie o backend

npm start


### 5. Inicie o frontend

npm run serve


👥 Perfis de Usuário
Paciente: pode se cadastrar, fazer login, agendar consultas e visualizar suas consultas.

Secretário: pode acessar o painel administrativo e visualisar todos os agendamentos e fazer cancelamentos de agendas.

📦 Estrutura do Projeto


├── backend
│   ├── controllers
│   ├── models
│   ├── routes
│   ├── middlewares
│   └── .env.example
├── frontend
│   ├── views
│   ├── components
│   └── assets



📄 Documentação Técnica
As rotas protegidas utilizam middleware JWT

O agendamento verifica conflitos de horário e consulta CEP/clima antes de salvar

O painel administrativo exibe todas as consultas com opção de cancelamento


Deploy
Este projeto está preparado para deploy, mas a versão entregue é para execução local. Caso deseje publicar, recomenda-se o uso de serviços como Render, Vercel, Railway ou MongoDB Atlas.

Autor
Desenvolvido por José Luis Tavares de Medeiros
Curso: Superior de Tecnologia em Análise e Desenvolvimento de Sistemas Instituição: Universidade Veiga de Almeida
Ano: 2025

Licença
Este projeto é entregue como trabalho acadêmico e não possui licença comercial. Uso permitido apenas para fins educacionais.

