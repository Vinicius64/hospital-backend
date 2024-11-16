const express = require('express');
const { SECRET_KEY } = require('../../config');
const { PrismaClient } = require('@prisma/client');
const expressJwt = require('express-jwt');
const { v4 } = require('uuid');

const router = express.Router();
const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error']
  });
const requireAuth = expressJwt.expressjwt({ secret: SECRET_KEY, algorithms: ['HS256'] });

router.post("/endereco/:idPaciente", async(req,res)=>{
    const {cep,bairro,logradouro,estado} = req.body
    const {idPaciente} = req.params

    try {
        if(!cep ||  !cep.trim() || 
           !bairro || !bairro.trim() ||
           !logradouro || !logradouro.trim() || !estado || !estado.trim()
        ){
            throw new Error("Nenhum campo pode estar em branco")
        }
        if(!idPaciente){
            throw new Error("Id do paciente não inforamado")
        }

        const endereco = await prisma.Endereco_paciente.create({
            data: {
                id: v4(),
                cep,
                bairro,
                logradouro,
                estado,
                idPaciente: idPaciente
            },
            select: {cep: true}
        });
        res.status(201).json({
            message: "endereço adicioando com sucesso",
            endereco
        })
    }catch(err){
        res.status(400).json({message: "Erro ao adicioanr o endereço", error: err.message})
    }
});

router.post("/endereco/:idMedico", async(req,res)=>{
    const {cep,bairro,logradouro,estado} = req.body
    const {idMedico} = req.params

    try {
        if(!cep ||  !cep.trim() || 
           !bairro || !bairro.trim() ||
           !logradouro || !logradouro.trim() || !estado || !estado.trim()
        ){
            throw new Error("Nenhum campo pode estar em branco")
        }
        if(!idMedico){
            throw new Error("Id do medico não inforamado")
        }

        const endereco = await prisma.endereco_medico.create({
            data: {
                id: v4(),
                cep,
                bairro,
                logradouro,
                estado,
                idMedico: idMedico
            },
            select: {cep: true}
        });
        res.status(201).json({
            message: "endereço adicioando com sucesso",
            endereco
        })
    }catch(err){
        res.status(400).json({message: "Erro ao adicioanar o endereço", error: err.message})
    }
});

router.put("/endereco/:type/:id", requireAuth, async(req,res)=>{
    const {cep,bairro,logradouro,estado} = req.body
    const {type, id} = req.params

    try {
        if(!cep ||  !cep.trim() || 
           !bairro || !bairro.trim() ||
           !logradouro || !logradouro.trim() || !estado || !estado.trim()
        ){
            throw new Error("Nenhum campo pode estar em branco")
        }
        if(!id){
            throw new Error("Id não inforamado")
        }
        let endereco
        if(type === 'medico'){
            endereco = await prisma.endereco_medico.update({
                where: {idMedico: id},
                data: {
                    cep,
                    bairro,
                    logradouro,
                    estado
                },
                select: {cep: true}
            });
        }
        else if(type === 'paciente'){
            endereco = await prisma.endereco_paciente.update({
                where: {idPaciente: id},
                data: {
                    cep,
                    bairro,
                    logradouro,
                    estado
                },
                select: {cep: true}
            });
        }
        else{
            res.status(400).json({
                message: "tipo invalido",
            })
        }
        
        res.status(201).json({
            message: "endereço alterado com sucesso",
            endereco
        })
    }catch(err){
        res.status(400).json({message: "Erro ao alterar o endereço", error: err.message})
    }
});

module.exports = router;

