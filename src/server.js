require('dotenv').config()
const mongoose = require('mongoose')
const express = require('express');
const mainRoutes = require('./routes/index');

const app = express();


app.use(express.json());

// Todas as rotas centralizadas
app.use(mainRoutes);

mongoose.connect(process.env.DATABASE_URL)
    .then(() => console.log("Connected!"))
    .catch((err) => console.error("Database error!"))

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor ON na porta ${PORT}`);
});