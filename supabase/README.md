# Supabase - Meu MEI Pro

## Executar migrações

Para que o Dashboard funcione (faturamento, DAS, notas fiscais), execute o SQL das migrações no painel do Supabase:

1. Acesse [supabase.com](https://supabase.com) → seu projeto
2. Vá em **SQL Editor**
3. Copie o conteúdo de `migrations/001_dashboard_tables.sql`
4. Cole e execute (Run)

Isso criará as tabelas:
- `lancamentos` — receitas e despesas
- `mei_profile` — perfil do MEI (atividade para DAS)
- `notas_fiscais` — notas emitidas
