# Regras do Projeto (VinoVision AI)

## Fluxo de Branches e Deploy

1. **Desenvolvimento e Testes (`develop`)**:
   - TODAS as modificações, correções de bugs, novas telas e testes devem ser feitos exclusivamente na branch `develop`.
   - Commits e pushes durante o desenvolvimento serão feitos APENAS na branch `develop` (Preview Deployments da Vercel).

2. **Produção (`main`)**:
   - NENHUM commit ou merge deve ser feito na branch `main` de forma automática.
   - O merge da `develop` para a `main` (Produção) deve ser realizado **EXCLUSIVAMENTE quando o usuário solicitar expressamente** (ex: "Pode passar para a main", "Promover para prod", etc.).
