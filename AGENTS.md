# Diretrizes do projeto Brasa Quente

- Respeite a arquitetura existente em camadas: Controller, Service e Repository.
- Reutilize componentes, serviços, funções e arquivos existentes antes de criar novos.
- Não crie pastas ou arquivos sem necessidade.
- Evite abstrações excessivas, lógica duplicada e refatorações de funcionalidades que já funcionam.
- Priorize código simples, organizado e fácil de explicar na apresentação do TCC.
- Preserve o funcionamento com PostgreSQL e SQLite.
- Faça alterações pequenas e valide cada etapa antes de avançar.
- Não adicione bibliotecas quando React e o CSS existentes forem suficientes.
- Ao concluir uma tarefa, explique brevemente quais arquivos foram modificados e por quê.
- Preserve instruções preexistentes relevantes ao atualizar este arquivo.
- Antes de alterar comportamentos específicos do Next.js, consulte a documentação da versão instalada em `node_modules/next/dist/docs/`, pois ela pode diferir de versões anteriores.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
