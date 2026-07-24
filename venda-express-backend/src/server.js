const express = require('express');
const cors = require('cors');
require('dotenv').config();

const path = require('path');

const authRoutes = require('./routes/auth.routes');
const plansRoutes = require('./routes/plans.routes');
const storesRoutes = require('./routes/stores.routes');
const adminRoutes = require('./routes/admin.routes');
const categoriesRoutes = require('./routes/categories.routes');
const subcategoriesRoutes = require('./routes/subcategories.routes');
const productsRoutes = require('./routes/products.routes');
const ordersRoutes = require('./routes/orders.routes');
const customersRoutes = require('./routes/customers.routes');
const uploadsRoutes = require('./routes/uploads.routes');
const storefrontRoutes = require('./routes/storefront.routes');
const detalhesProdutosRoutes = require('./routes/detalhes_produtos.routes');
const paymentsRoutes = require('./routes/payments.routes');
const signupRoutes = require('./routes/signup.routes');

const { getSubscriptionStatus } = require('./controllers/stores.controller');
const { requireAuth } = require('./middleware/auth.middleware');
const { requireActiveSubscription } = require('./middleware/subscription.middleware');

const app = express();
app.use(cors());

// A EMIS nem sempre envia Content-Type: application/json na callback.
// Sem isto, req.body vinha vazio e o pagamento nunca era reconhecido.
app.use(express.json({ type: ['application/json', 'text/plain', 'application/*+json'] }));
app.use(express.urlencoded({ extended: true }));

// =====================================================================
// ROTAS SEM BLOQUEIO
// Nunca meter requireActiveSubscription aqui: ou não há sessão ainda,
// ou é precisamente por aqui que a pessoa se desbloqueia.
// =====================================================================
app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);          // login / registo / me
app.use('/api/signup', signupRoutes);      // registo pago + teste de 7 dias
app.use('/api/plans', plansRoutes);        // catálogo de planos (público)
app.use('/api/payments', paymentsRoutes);  // pagar é a saída do bloqueio
app.use('/api/stores', storesRoutes);      // /stores/mine tem de responder mesmo suspensa
app.use('/api/admin', adminRoutes);
app.use('/api/storefront', storefrontRoutes); // loja pública

// Ficheiros enviados (imagens de produtos, logótipos) — servidos a toda a gente,
// senão o storefront público ficava sem imagens.
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Estado da subscrição: informativo, nunca devolve 402.
app.get('/api/subscription/status', requireAuth, getSubscriptionStatus);

// =====================================================================
// ROTAS COM BLOQUEIO
// Loja com teste expirado ou plano vencido recebe 402 SUBSCRIPTION_REQUIRED.
// O frontend usa esse código para abrir o modal de pagamento.
// =====================================================================
app.use('/api/products', requireAuth, requireActiveSubscription, productsRoutes);
app.use('/api/categories', requireAuth, requireActiveSubscription, categoriesRoutes);
app.use('/api/subcategories', requireAuth, requireActiveSubscription, subcategoriesRoutes);
app.use('/api/uploads', requireAuth, requireActiveSubscription, uploadsRoutes);
app.use('/api/detalhes-produtos', requireAuth, requireActiveSubscription, detalhesProdutosRoutes);

// Encomendas e clientes ficam de FORA do bloqueio de propósito: quem já
// vendeu tem direito a ver a quem deve entregar, mesmo com o plano vencido.
// Se quiseres apertar, muda estas duas linhas para o bloco de cima.
app.use('/api/orders', ordersRoutes);
app.use('/api/customers', customersRoutes);

// =====================================================================
// APANHA-TUDO
// =====================================================================
app.use('/api', (req, res) => {
  res.status(404).json({ error: `Rota não encontrada: ${req.method} ${req.originalUrl}` });
});

app.use((err, req, res, next) => {
  console.error('[erro não tratado]', req.method, req.originalUrl, err);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: 'Erro no servidor' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API a correr em http://localhost:${PORT}`));