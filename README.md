# Brasa Quente

Sistema de pizzaria desenvolvido com Next.js, Prisma e PostgreSQL. Inclui catálogo, carrinho, checkout convidado, cadastro e autenticação de clientes, entrega ou retirada, registro de pagamento e recebimento, acompanhamento público de pedidos, painel administrativo, opções de borda e promoções por produto.

## Desenvolvimento

1. Configure `DATABASE_URL` em `.env`.
2. Instale as dependências com `npm install`.
3. Aplique migrations com `npx prisma migrate dev`.
4. Gere o client com `npx prisma generate`.
5. Inicie com `npm run dev`.

O seed cadastra apenas produtos iniciais ausentes e não apaga pedidos ou produtos existentes.

## Desenvolvimento local com SQLite

O PostgreSQL continua sendo o banco padrão. O SQLite é selecionado somente pelos scripts `sqlite:*`, que definem explicitamente `DATABASE_PROVIDER=sqlite` e usam o arquivo persistente `prisma/local/brasa-quente.db`.

Não execute as migrations de `prisma/migrations` no SQLite: elas são exclusivas do PostgreSQL. O banco local é criado a partir de `prisma/sqlite/schema.prisma` com `prisma db push`, sem `--force-reset` e sem `--accept-data-loss`.

### Primeira inicialização

Instale as dependências e crie as tabelas, o client SQLite e as pizzas iniciais:

```powershell
npm install
npm run sqlite:setup
```

O comando é idempotente: execuções posteriores preservam clientes, pedidos, sessões e produtos existentes, e o seed inclui apenas as pizzas ausentes.

### Administrador local

No PowerShell, defina credenciais apenas para o processo atual e execute o script compartilhado de criação de administrador:

```powershell
$env:ADMIN_NOME="Administrador Local"
$env:ADMIN_EMAIL="admin@local.test"
$env:ADMIN_SENHA="troque-esta-senha"
npm run sqlite:admin
Remove-Item Env:ADMIN_NOME,Env:ADMIN_EMAIL,Env:ADMIN_SENHA
```

### Executar e verificar

```powershell
npm run sqlite:check
npm run dev:sqlite
```

A aplicação estará em `http://localhost:3000`. `sqlite:check` informa o provedor, o arquivo selecionado e a quantidade de registros persistidos.

O arquivo do banco, seus arquivos auxiliares (`-wal`, `-shm` e `-journal`), os clients gerados e todos os arquivos `.env*` permanecem fora do Git. Somente `prisma/local/.gitkeep` é versionado.

### PostgreSQL e produção

- `npm run dev`, `npm run build`, `npm start`, `npm run admin:create` e os comandos Prisma sem a configuração SQLite continuam usando `DATABASE_URL`, `prisma/schema.prisma`, `prisma7.config.ts`, `PrismaPg` e `prisma/migrations`.
- `DATABASE_PROVIDER` ausente seleciona PostgreSQL. Somente `DATABASE_PROVIDER=sqlite` seleciona `PrismaBetterSqlite3` e exige `SQLITE_DATABASE_URL` iniciada por `file:`.
- `npm run build` regenera os dois clients para validar os schemas, mas a aplicação produzida continua escolhendo PostgreSQL quando `DATABASE_PROVIDER` não está definido. Nenhum script SQLite é executado automaticamente no build ou no deploy.
- Para confirmar o ambiente local, execute `npm run sqlite:check`. No servidor, mantenha `DATABASE_PROVIDER` ausente (ou defina explicitamente `postgresql`) e configure `DATABASE_URL` com a URL PostgreSQL. Confirme também pelas variáveis do provedor de deploy; um build local aprovado, isoladamente, não comprova a conexão de produção.

## Imagens de produtos

As nove pizzas iniciais usam arquivos versionados em `public/pizzas`. No cadastro administrativo, a imagem pode ser definida por caminho público local (por exemplo, `/pizzas/minha-pizza.jpg`) ou por URL HTTPS.

Não há upload binário persistente em produção: o filesystem da Vercel é efêmero. Para essa evolução, conecte um armazenamento externo (como Vercel Blob, Cloudinary ou S3), salve apenas a URL no campo existente e inclua o domínio no `remotePatterns` do Next.js quando a otimização de imagens for usada. Nenhuma credencial de armazenamento deve ser colocada no repositório.

## Segurança

- Sessão por cookie HttpOnly, Secure em produção e SameSite=Lax.
- Cadastro e login de clientes validados no servidor, com senha protegida por `scrypt` e sessão em cookie seguro.
- Login e autorização administrativa verificados no servidor; somente administradores acessam endpoints administrativos.
- O catálogo e o checkout continuam públicos, sem exigir conta de cliente.
- Preços, promoções e acréscimos de borda calculados no backend.
- Taxa de entrega e valor do recebimento calculados no backend; não há gateway ou pagamento real.
- Acompanhamento público exige número do pedido e telefone normalizado, usa resposta genérica e limite local de tentativas.
- Validação de origem em rotas mutáveis.
- Limite local de tentativas de login. Em implantação com múltiplas instâncias, use um armazenamento distribuído para o rate limiting.
- Limite local de pedidos públicos por origem, sem depender de infraestrutura externa.

## Receita e recebimentos

São conceitos diferentes no dashboard. Receita soma os valores históricos dos pedidos não cancelados. Valor recebido soma exclusivamente os registros de recebimento marcados como `Pago`; registros `Pendente` ou `Falhou` não entram nesse indicador. Pedidos anteriores à funcionalidade permanecem sem método e recebimento registrados, sem backfill artificial.

## Verificações

```bash
npx prisma format
npx prisma validate
npx prisma migrate status
npx tsc --noEmit
npm run lint
npm run build
```
