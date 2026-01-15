# 🚀 GUIA RÁPIDO - CONFIGURAR SUPABASE

## ✅ PASSO A PASSO:

### **1. Criar Projeto no Supabase**

1. Acesse: https://supabase.com
2. Clique em **"New Project"**
3. Preencha:
   - **Name:** `binance-trading-system`
   - **Database Password:** Escolha uma senha forte
   - **Region:** Escolha mais próximo de você
4. Clique em **"Create new project"**
5. Aguarde 2-3 minutos (criação do projeto)

---

### **2. Executar Schema SQL**

1. No Supabase Dashboard, vá em:
   ```
   SQL Editor (ícone </> no menu lateral)
   ```

2. Clique em **"+ New query"**

3. Copie TODO o conteúdo do arquivo:
   ```
   supabase/schema.sql
   ```

4. Cole no editor SQL

5. Clique em **"Run"** (ou pressione `Ctrl+Enter`)

6. Aguarde a execução (pode levar 10-20 segundos)

7. Verifique se apareceu:
   ```
   ✅ Success. No rows returned
   ```

---

### **3. Pegar Credenciais**

1. No Supabase Dashboard, vá em:
   ```
   Settings (⚙️ no menu lateral) → API
   ```

2. Copie as seguintes informações:

   **Project URL:**
   ```
   https://abc123xyz.supabase.co
   ```

   **anon public (chave pública):**
   ```
   eyJhbGciOiJIUzI1NiIs... (longa string)
   ```

   **service_role (chave de serviço):**
   ```
   eyJhbGciOiJIUzI1NiIs... (outra longa string)
   ```

---

### **4. Adicionar no `.env`**

1. Abra o arquivo:
   ```
   server/.env
   ```

2. Adicione/atualize as linhas:
   ```env
   SUPABASE_URL=https://abc123xyz.supabase.co
   SUPABASE_KEY=eyJhbGciOiJIUzI1NiIs...
   SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIs...
   ```

3. Salve o arquivo

---

### **5. Reiniciar Servidor**

```bash
# Terminal do servidor
cd server
npm start
```

---

## ✅ VERIFICAR SE FUNCIONOU:

### **No Supabase Dashboard:**

1. Vá em **"Table Editor"**

2. Você deve ver **10 tabelas**:
   - users
   - user_settings
   - trades
   - crt_analysis
   - opportunities
   - learning_reports
   - crt_validations
   - trading_stats
   - balances
   - system_logs

---

## 📊 ESTRUTURA DAS TABELAS:

### **users** - Usuários do sistema
- id, user_id, email, created_at, updated_at

### **user_settings** - Configurações
- API keys, exchange, leverage, trade_amount

### **trades** - Operações
- entry, exit, profit, SL, TP, status

### **crt_analysis** - Análises CRT
- PCC, 4H OHLC, manipulation, quadrant

### **opportunities** - Oportunidades
- type, confidence, pair, detected_at

### **learning_reports** - Relatórios IA
- videos, concepts, score, session

### **crt_validations** - Validações
- errors, corrections, status

### **trading_stats** - Estatísticas
- win_rate, total_trades, profit

### **balances** - Saldos
- total, available, in_position

### **system_logs** - Logs
- level, message, data

---

## ⚠️ IMPORTANTE:

### **Row Level Security (RLS):**
- ✅ Já configurado automaticamente
- ✅ Cada usuário vê apenas seus dados

### **Performance:**
- ✅ Índices criados automaticamente
- ✅ Queries otimizadas

### **Backup:**
- ✅ Supabase faz backup automático
- ✅ Acesse em: Dashboard → Database → Backups

---

## 🔧 TROUBLESHOOTING:

### **Erro ao executar SQL:**
- Verifique se copiou TODO o arquivo schema.sql
- Execute em um SQL Editor vazio
- Se já executou antes, delete as tabelas primeiro

### **Credenciais não funcionam:**
- Verifique se copiou corretamente (sem espaços)
- Use a chave `anon` para frontend
- Use a chave `service_role` para backend

### **Tabelas não aparecem:**
- Atualize a página do Supabase
- Vá em Table Editor → Refresh
- Verifique se o SQL foi executado com sucesso

---

## ✅ PRÓXIMOS PASSOS:

Depois de configurado, o sistema irá:

1. ✅ Salvar trades automaticamente
2. ✅ Registrar análises CRT
3. ✅ Armazenar oportunidades
4. ✅ Guardar relatórios de aprendizado
5. ✅ Manter logs do sistema

---

**🗄️ SUPABASE PRONTO!**

Agora você tem um banco de dados profissional na nuvem! 🚀
