const express = require('express');
const { SECRET_KEY } = require('../../config');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const expressJwt = require('express-jwt');

const router = express.Router();
const prisma = new PrismaClient();
const requireAuth = expressJwt.expressjwt({ secret: SECRET_KEY, algorithms: ['HS256'] });

async function hashPassword(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
}

// Rotas CRUD para Medico
router.post('/medicos', async (req, res) => {
    const { nome, CRI, sexo, dataNascimento, especialidade, email, senha } = req.body;
    const hashedPassword = await hashPassword(senha);
    const medico = await prisma.medico.create({
      data: { nome, CRI, sexo, dataNascimento, especialidade, email, senha: hashedPassword },
      select: { id: true, nome: true, CRI: true, sexo: true, dataNascimento: true, especialidade: true }
    });
    res.json(medico);
});
  
router.get('/medicos', requireAuth, async (req, res) => {
const medicos = await prisma.medico.findMany({
    select: { id: true, nome: true, CRI: true, sexo: true, dataNascimento: true, especialidade: true }
});
res.json(medicos);
});

router.get('/medicos/:id', requireAuth, async (req, res) => {
const { id } = req.params;
const medico = await prisma.medico.findUnique({ 
    where: { id: parseInt(id) },
    select: { id: true, nome: true, CRI: true, sexo: true, dataNascimento: true, especialidade: true }
});
res.json(medico);
});

router.put('/medicos/:id/', requireAuth, async (req, res) => {
const { id } = req.params;
const { nome, sexo, dataNascimento, especialidade } = req.body;
try {
    const medico = await prisma.medico.update({
    where: { id: parseInt(id) },
    data: { nome, sexo, dataNascimento, especialidade},
    select: { id: true, nome: true, CRI: true, sexo: true, dataNascimento: true, especialidade: true }
    });
    res.json(medico);
} catch (error) {
    res.status(400).json({ message: 'Erro ao atualizar médico', error });
}
});

router.put('/medicos/:id/delete', requireAuth, async (req, res) => {
const { id } = req.params;
try {
    await prisma.medico.update({
    where: { id: parseInt(id) },
    data: { deleted: true }
    });
    res.json({ message: 'Médico deletado logicamente' });
} catch (error) {
    res.status(400).json({ message: 'Erro ao deletar médico', error });
}
});

module.exports = router;