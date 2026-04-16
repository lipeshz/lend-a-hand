require('dotenv').config()
const mongoose = require('mongoose')
const express = require('express');
const dns = require("dns");
const mainRoutes = require('./routes/index');

dns.setServers([
    '1.1.1.1',
    '8.8.8.8'
])

const app = express();
app.use(express.json());

// Todas as rotas centralizadas
app.use(mainRoutes);

mongoose.connect(process.env.DATABASE_URL)
    .then(() => console.log("Connected!"))
    .catch((err) => console.error("Database error!" + err))

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor ON na porta ${PORT}`);
});