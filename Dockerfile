# Estágio 1: "Builder" - Onde a aplicação é construída
# -----------------------------------------------------
# Usa uma imagem leve (alpine) com Node.js para a compilação.
FROM node:20-alpine AS builder 
WORKDIR /app

# Otimização de Cache: Copia apenas o package.json primeiro. 
# O Docker só reinstalará as dependências se este arquivo mudar.
COPY package*.json ./ 
RUN npm install

# Copia o restante do código-fonte.
COPY . . 
# Executa o script de build do Vite, que gera os arquivos estáticos na pasta /dist.
RUN npm run build 

# Estágio 2: "Produção" - Onde a aplicação é servida
# ---------------------------------------------------
# Usa uma imagem Nginx super leve. Apenas o necessário para servir arquivos.
FROM nginx:stable-alpine 

# A "mágica" do multi-stage: Copia APENAS os arquivos compilados da pasta /dist 
# do estágio "builder" para a pasta pública do Nginx.
# Resultado: Nenhum código-fonte, Node.js ou node_modules vai para a imagem final.
COPY --from=builder /app/dist /usr/share/nginx/html 

# Substitui a configuração padrão do Nginx pela nossa, otimizada para SPAs.
COPY nginx.conf /etc/nginx/conf.d/default.conf 

# Expõe a porta 80, que o Traefik usará para se conectar.
EXPOSE 80 
# Comando para iniciar o Nginx em primeiro plano, como o Docker espera.
CMD ["nginx", "-g", "daemon off;"] 
