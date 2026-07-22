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



const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/plans', plansRoutes);
app.use('/api/stores', storesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/subcategories', subcategoriesRoutes);
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use('/api/uploads', uploadsRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/storefront', storefrontRoutes);
app.use('/api/detalhes-produtos', detalhesProdutosRoutes);




const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API a correr em http://localhost:${PORT}`));