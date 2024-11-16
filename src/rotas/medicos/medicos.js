const express = require('express');
const { SECRET_KEY } = require('../../config');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const expressJwt = require('express-jwt');
const { v4 } = require('uuid');


const router = express.Router();
const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error']
  });
const requireAuth = expressJwt.expressjwt({ secret: SECRET_KEY, algorithms: ['HS256'] });

function isAdmin(req, res, next) {
    if (req.auth && req.auth.role === 'admin') {
        return next();
    }
    return res.status(403).json({ message: 'Acesso negado. Apenas administradores têm acesso a essa rota' });
}

async function hashPassword(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
}

// Rotas CRUD para Médico
router.post('/medicos', async (req, res) => {
    const { nome, CRI, sexo, dataNascimento, especialidade, email, senha } = req.body;
    try {
        if (!nome || !nome.trim() || !CRI || !CRI.trim() || !sexo || !sexo.trim() || !dataNascimento || !dataNascimento.trim() || !especialidade || !especialidade.trim() || !email || !email.trim() || !senha || !senha.trim()) {
            throw new Error("Nenhum campo pode estar em branco");
        }
        if (await prisma.medico.findFirst({ where: { email } })) {
            throw new Error("Esse email já está em uso");
        }
        if (await prisma.medico.findFirst({ where: { CRI } })) {
            throw new Error("Esse CRI já está em uso");
        }
        const hashedPassword = await hashPassword(senha.trim());
        const medico = await prisma.medico.create({
            data: { id: v4(),nome: nome.trim(), CRI: CRI.trim(), sexo: sexo.trim(), dataNascimento: dataNascimento.trim(), especialidade: especialidade.trim(), email:email.trim(), senha: hashedPassword },
            select: { id: true, nome: true, CRI: true, sexo: true, dataNascimento: true, especialidade: true }
        });
        res.json(medico);
    } catch (error) {
        res.status(400).json({ message: 'Erro ao criar médico', error: error.message });
    }
});

router.get('/medicos', requireAuth, isAdmin, async (req, res) => {
    const whereClause = {
        deleted: false
    }
    try {
        const medicos = await prisma.medico.findMany({
            where: whereClause,
            select: { id: true, nome: true, CRI: true, email: true, sexo: true, dataNascimento: true, especialidade: true }
        });
        res.json(medicos);
    } catch (error) {
        res.status(400).json({ message: 'Erro ao buscar médicos', error: error.message });
    }
});

router.get('/medicos/:id', requireAuth, async (req, res) => {
    const { id } = req.params;
    try {
        if(!id) throw new Error('ID não informado');
        const buscaMedico = await prisma.medico.findUnique({
            where: { id: id },
            select: { id: true, nome: true, CRI: true, sexo: true, dataNascimento: true, especialidade: true, email: true, endereco:true, imagem: true }
        });

        res.json(buscaMedico);
    } catch (error) {
        res.status(400).json({ message: 'Erro ao buscar médico', error: error.message });
    }
});

router.put('/medicos/:id', requireAuth, async (req, res) => {
    const { id } = req.params;
    const { nome, sexo, dataNascimento, especialidade } = req.body;
    try {
        if(!id) throw new Error('ID não informado');
        if(!nome || !nome.trim() || !sexo|| !sexo.trim() || !dataNascimento || !especialidade) throw new Error('Nenhum campo pode estar em branco');
        const medico = await prisma.medico.update({
            where: { id: id },
            data: { nome, sexo, dataNascimento, especialidade },
            select: { id: true, nome: true, CRI: true, sexo: true, dataNascimento: true, especialidade: true }
        });
        res.json(medico);
    } catch (error) {
        res.status(400).json({ message: 'Erro ao atualizar médico', error });
    }
});

router.delete('/medicos/:id', requireAuth, isAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        if(!id) throw new Error('ID não informado');
        await prisma.medico.update({
            where: { id: id },
            data: { deleted: true }
        });
        res.json({ message: 'Médico deletado logicamente' });
    } catch (error) {
        res.status(400).json({ message: 'Erro ao deletar médico', error });
    }
});

router.get('/medicos/:id/consultas', requireAuth, async (req, res) => {
    const { id } = req.params;

    if (req.auth.role !== 'medico' || req.auth.id !== id) {
        return res.status(403).json({ message: 'Acesso negado, somente médicos têm acesso a suas consultas.' });
    }

    try {
        if (!id) throw new Error('ID não informado');
        const consultas = await prisma.consulta.findMany({
            where: { idMedico: id },
            include: { paciente: true }
        });
        res.json(consultas);
    } catch (error) {
        res.status(400).json({ message: 'Erro ao buscar consultas', error });
    }
});

module.exports = router;
