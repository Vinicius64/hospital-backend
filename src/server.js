const express = require('express');
const corsMiddleware = require("./corsConfig")
const medicoRoutes = require('./rotas/medicos/medicos');
const pacienteRoutes = require('./rotas/pacientes/pacientes');
const consultaRoutes = require('./rotas/consultas/consultas');
const exameRoutes = require('./rotas/exames/exames');
const logRoutes = require('./rotas/logs/log');
const enderecoRoutes = require('./rotas/endereco/endereco');
const imagemRoutes = require('./rotas/imagens/imagens');
const errorHandler = require('./middleware/errorHandler');

const { authenticate } = require('./authentication');

const app = express();


app.use(express.json());
app.use(corsMiddleware);
app.use(medicoRoutes);
app.use(pacienteRoutes);
app.use(consultaRoutes);
app.use(exameRoutes);
app.use(logRoutes);
app.use(enderecoRoutes);
app.use(imagemRoutes);


app.use(errorHandler);

// Rota de login para pacientes
app.post('/login', authenticate, (req, res) => {
    res.json({ message: 'Login de paciente bem-sucedido', user: req.user });
  });

app.get("/", (req, res) => {
  console.log("ola")
  res.send("Ola")
})

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});