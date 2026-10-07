# Brasa Quente

Sistema de pizzaria desenvolvido com Next.js, Prisma e PostgreSQL. Inclui catálogo, carrinho, checkout convidado com dados de entrega, painel administrativo, opções de borda e promoções por produto.

## Desenvolvimento

1. Configure `DATABASE_URL` em `.env`.
2. Instale as dependências com `npm install`.
3. Aplique migrations com `npx prisma migrate dev`.
4. Gere o client com `npx prisma generate`.
5. Inicie com `npm run dev`.

O seed cadastra apenas produtos iniciais ausentes e não apaga pedidos ou produtos existentes.

## Imagens de produtos

As nove pizzas iniciais usam arquivos versionados em `public/pizzas`. No cadastro administrativo, a imagem pode ser definida por caminho público local (por exemplo, `/pizzas/minha-pizza.jpg`) ou por URL HTTPS.

Não há upload binário persistente em produção: o filesystem da Vercel é efêmero. Para essa evolução, conecte um armazenamento externo (como Vercel Blob, Cloudinary ou S3), salve apenas a URL no campo existente e inclua o domínio no `remotePatterns` do Next.js quando a otimização de imagens for usada. Nenhuma credencial de armazenamento deve ser colocada no repositório.

## Segurança

- Sessão por cookie HttpOnly, Secure em produção e SameSite=Lax.
- Login e autorização administrativa verificados no servidor; clientes fazem pedidos sem conta.
- Preços, promoções e acréscimos de borda calculados no backend.
- Validação de origem em rotas mutáveis.
- Limite local de tentativas de login. Em implantação com múltiplas instâncias, use um armazenamento distribuído para o rate limiting.
- Limite local de pedidos públicos por origem, sem depender de infraestrutura externa.

## Verificações

```bash
npx prisma format
npx prisma validate
npx prisma migrate status
npx tsc --noEmit
npm run lint
npm run build
```
