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

async function hashPassword(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
}

function isAdmin(req, res, next) {
    if (req.auth && req.auth.role === 'admin') {
        return next();
    }
    return res.status(403).json({ message: 'Acesso negado. Apenas administradores têm acesso a essa rota' });
}

// Rotas CRUD para Paciente
router.post('/pacientes', async (req, res) => {
    const { nome, CPF, sexo, dataNascimento, estadoCivil, email, senha } = req.body;
    const hashedPassword = await hashPassword(senha);
    try {
        if (!nome || !nome.trim() || !CPF || !CPF.trim() || !sexo || !sexo.trim() || !dataNascimento || !dataNascimento.trim() || !estadoCivil || !estadoCivil.trim() || !email || !email.trim() || !senha || !senha.trim()) {
            throw new Error("Nenhum campo pode estar em branco");
        }

        if (await prisma.paciente.findFirst({ where: { email } })) {
            throw new Error("Esse email já está em uso");
        }

        if (await prisma.paciente.findFirst({ where: { CPF } })) {
            throw new Error("Esse CPF já está em uso");
        }
        const paciente = await prisma.paciente.create({
            data: { 
                id: v4(),
                nome: nome.trim(), 
                CPF: CPF.trim(), 
                sexo: sexo.trim(), 
                dataNascimento: dataNascimento.trim(),
                estadoCivil: estadoCivil.trim(), 
                email: email.trim(), 
                senha: hashedPassword.trim() 
            },
            select: { id: true, nome: true, CPF: true, sexo: true, dataNascimento: true, estadoCivil: true }
        });
        res.json(paciente);
    } catch (error) {
        res.status(400).json({ message: 'Erro ao criar paciente', error: error.message });
    }
});

router.get('/pacientes', requireAuth, isAdmin, async (req, res) => {
    const whereClause = {
        deleted: false
    }
    try {
        const pacientes = await prisma.paciente.findMany({
            where: whereClause,
            select: { id: true, nome: true, CPF: true, email: true, sexo: true, dataNascimento: true, estadoCivil: true }
        });
        res.json(pacientes);
    } catch (error) {
        res.status(400).json({ message: 'Erro ao buscar pacientes', error: error.message });
    }
});

router.get('/pacientes/:id', requireAuth, async (req, res) => {
    const { id } = req.params;
    try {
        if(!id) throw new Error("ID não informado");
        const buscaPaciente = await prisma.paciente.findUnique({
            where: { id: id },
            select: { id: true, nome: true, CPF: true, sexo: true, dataNascimento: true, estadoCivil: true, email:true, endereco:true,imagem: true }
        });
        
        console.log("endereço do paciente: ",buscaPaciente)

        res.json(buscaPaciente);
    } catch (error) {
        res.status(400).json({ message: 'Erro ao buscar paciente', error: error.message });
    }
});

router.put('/pacientes/:id', requireAuth, async (req, res) => {
    const { id } = req.params;
    const { nome, sexo, dataNascimento, estadoCivil } = req.body;

    try {
        if(!id) throw new Error("ID não informado");
        const data = {};
        if (nome && nome.trim()) data.nome = nome.trim();
        if (sexo && sexo.trim()) data.sexo = sexo.trim();
        if (dataNascimento && dataNascimento.trim()) data.dataNascimento = dataNascimento.trim();
        if (estadoCivil && estadoCivil.trim()) data.estadoCivil = estadoCivil.trim();
        const paciente = await prisma.paciente.update({
            where: { id: id },
            data: { nome, sexo, dataNascimento: dataNascimento, estadoCivil },
            select: { id: true, nome: true, CPF: true, sexo: true, dataNascimento: true, estadoCivil: true }
        });
        res.json(paciente);
    } catch (error) {
        res.status(400).json({ message: 'Erro ao atualizar paciente', error: error.message });
    }
});

router.delete('/pacientes/:id', requireAuth, isAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        if(!id) throw new Error("ID não informado");
        if(!await prisma.paciente.findFirst({ where: { id: id } })) throw new Error("Paciente não encontrado");
        await prisma.paciente.update({
            where: { id: id },
            data: { deleted: true }
        });
        res.json({ message: 'Paciente deletado' });
    } catch (error) {
        res.status(400).json({ message: 'Erro ao deletar paciente', error: error.message });
    }
});

router.get('/pacientes/:id/consultas', requireAuth, async (req, res) => {
    const { id } = req.params;

    if (req.auth.role !== 'paciente' || req.auth.id !== id) {
        return res.status(403).json({ message: 'Acesso negado, apenas pacientes podem acessar suas consultas.' });
    }

    try {
        if(!id) throw new Error("ID não informado");
        const consultas = await prisma.consulta.findMany({
            where: { idPaciente: id },
            include: { medico: true }
        });
        res.json(consultas);
    } catch (error) {
        res.status(400).json({ message: 'Erro ao buscar consultas', error: error.message });
    }
});

router.get('/pacientes/:id/exames', requireAuth, async (req, res) => {
    const { id } = req.params;

    if (req.auth.role !== "paciente" || String(req.auth.id) !== id) {
        return res.status(403).json({ message: `Acesso negado, apenas pacientes podem acessar seus exames.${req.auth.id}` });
    }

    try {
        if(!id) throw new Error("ID não informado");
        const exames = await prisma.exame.findMany({
            where: { idPaciente: id },
            include: { medico: true }
        });
        res.json(exames);
    } catch (error) {
        res.status(400).json({ message: 'Erro ao buscar exames', error: error.message });
    }
});

module.exports = router;
