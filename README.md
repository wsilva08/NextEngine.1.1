# Next Engine - Guia de Deploy com Docker Swarm e Traefik

Este guia fornece instruções sobre como implantar a landing page da Next Engine em um ambiente de produção moderno usando **Docker Swarm** como orquestrador e **Traefik** como proxy reverso e gerenciador de SSL.

Este método oferece descoberta automática de serviços, balanceamento de carga e renovação de certificados SSL de forma automatizada.

## Desenvolvimento Local

Para rodar o projeto em sua máquina local para desenvolvimento, siga os passos abaixo.

1.  **Pré-requisitos**:
    *   [Node.js](https://nodejs.org/) (versão 20 ou superior)
    *   [npm](https://www.npmjs.com/) (geralmente vem com o Node.js)

2.  **Clone o repositório**:
    ```bash
    git clone https://github.com/seu-usuario/nextengine.git
    cd nextengine
    ```

3.  **Instale as dependências**:
    ```bash
    npm install
    ```

4.  **Inicie o servidor de desenvolvimento**:
    ```bash
    npm run dev
    ```
    O site estará disponível em `http://localhost:5173` (ou outra porta indicada no terminal). O servidor recarregará automaticamente a página sempre que você salvar uma alteração nos arquivos.

---

## Deploy em Produção com Docker Swarm

### Pré-requisitos

Antes de começar, certifique-se de que seu ambiente na VPS (Hetzner, etc.) atende aos seguintes requisitos:

1.  **Docker e Docker Swarm inicializado**: O Docker deve estar instalado e o modo Swarm ativado (`docker swarm init`).
2.  **Traefik rodando como um serviço Swarm**: Você já deve ter o Traefik configurado e implantado no seu cluster Swarm.
3.  **Uma rede Docker externa e "attachable"**: O Traefik precisa de uma rede compartilhada para se comunicar com os serviços que ele expõe. Geralmente, essa rede é chamada de `web` ou `traefik-public`. O nome `network_public` é usado nos exemplos abaixo.
    ```bash
    # Exemplo de como criar a rede, caso ainda não exista
    docker network create --driver=overlay --attachable network_public
    ```
4.  **Um nome de domínio** apontando para o endereço IP do seu nó manager do Swarm.

### Passos para o Deploy

#### Passo 1: Clone o Repositório e Prepare os Arquivos

Siga os passos de 1 a 4 do guia anterior para clonar o repositório e criar o `Dockerfile` e o arquivo de configuração do `nginx`.

#### Passo 2: Construa a Imagem Docker

É uma boa prática usar versões específicas em vez de `:latest`.

```bash
# O -t define o nome e a tag da imagem (nome:tag)
docker build -t nextengine:1.1 .
```

#### Passo 3: Implante o "Stack"

Com a imagem `nextengine:1.1` criada localmente, podemos implantar o stack.

```bash
docker stack deploy -c docker-compose.yml nextengine
```

-   `-c docker-compose.yml`: Especifica o arquivo de composição.
-   `nextengine`: É o nome que daremos ao nosso "stack" (conjunto de serviços).

O Swarm agora irá garantir que o serviço esteja sempre rodando. O Traefik detectará as labels, solicitará o certificado SSL (via HTTP ou DNS, dependendo da sua configuração) e começará a rotear o tráfego.

### Manutenção e Atualizações

Para implantar uma nova versão do código, o fluxo é:

```bash
# 1. Na sua VPS, vá para a pasta do projeto e puxe as alterações
cd /caminho/para/nextengine
git pull
    
# 2. Reconstrua a imagem com uma nova tag de versão
docker build -t nextengine:1.2 .
    
# 3. ATENÇÃO: Edite o arquivo docker-compose.yml e atualize a tag da imagem
# Troque 'image: nextengine:1.1' para 'image: nextengine:1.2'
nano docker-compose.yml
    
# 4. Execute o deploy novamente para que o Swarm atualize o serviço
docker stack deploy -c docker-compose.yml nextengine
```

### Solução de Problemas Avançada

#### Erro de Certificado Inválido (TRAEFIK DEFAULT CERT)

Se mesmo após verificar o DNS e o firewall o Traefik ainda não consegue gerar um certificado SSL, a solução mais robusta é mudar o método de validação da Let's Encrypt do `HTTP-01` para o **`DNS-01`**.

**O que é o desafio `DNS-01`?**
Em vez de acessar seu servidor pela porta 80, o Traefik usará a API do seu provedor de DNS para criar um registro temporário, provando a posse do domínio. Este método é mais confiável e contorna problemas de firewall e roteamento.

**Como implementar com Cloudflare (Recomendado e Gratuito):**

1.  **Crie uma conta na Cloudflare** e adicione seu site `nextengine.com.br`.
2.  **Altere os Nameservers:** No seu registrador de domínio (ex: Registro.br), substitua os nameservers existentes pelos fornecidos pela Cloudflare. Isso dará à Cloudflare o controle do DNS.
3.  **Crie um API Token na Cloudflare:**
    *   No painel da Cloudflare, vá em `My Profile > API Tokens > Create Token`.
    *   Use o template **"Edit zone DNS"**.
    *   Em "Zone Resources", selecione `Specific zone > nextengine.com.br`.
    *   Crie o token e **copie-o imediatamente**.
4.  **Configure o Traefik:** Você precisa adicionar o token da API ao seu **serviço principal do Traefik**. A forma mais comum é através de variáveis de ambiente no `docker-compose.yml` do Traefik.

    ```yaml
    # Exemplo para o docker-compose.yml do seu serviço Traefik
    services:
      traefik:
        # ... outras configurações ...
        environment:
          - "CF_API_TOKEN=SEU_TOKEN_COPIADO_DA_CLOUDFLARE"
    ```

5.  **Configure o Resolvedor de Certificados no Traefik:** No arquivo de configuração estática do Traefik (`traefik.yml` ou similar), ajuste seu `certresolver` para usar o `dnsChallenge`.

    ```yaml
    # Exemplo para o arquivo de configuração estática do Traefik
    certificatesResolvers:
      letsencrypt: # Nome do seu resolver
        acme:
          email: seu-email@dominio.com
          storage: acme.json
          # Substitua httpChallenge por dnsChallenge:
          dnsChallenge:
            provider: cloudflare
    ```
6.  **Reimplante o Traefik** para aplicar as novas configurações.
7.  **Reimplante sua aplicação `nextengine`** usando o `docker-compose.yml` deste repositório, que já está preparado para funcionar bem com o `DNS-01`.

Este processo, embora envolva mais passos iniciais, resolve 99% dos problemas persistentes de certificado SSL e é a arquitetura recomendada para produção.
