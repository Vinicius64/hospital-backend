const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { SECRET_KEY } = require('../../config');
const expressJwt = require('express-jwt');
const axios = require('axios');
const { v4 } = require('uuid');

const router = express.Router();
const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error']
});

const requireAuth = expressJwt.expressjwt({ secret: SECRET_KEY, algorithms: ['HS256'] });

router.get('/images/:type',requireAuth, async (req, res) => {
    const { type } = req.params;

    if (!['medico', 'paciente'].includes(type.toLowerCase())) {
        return res.status(400).json({ message: 'Tipo inválido! Use "medico" ou "paciente"' });
    }

    try {
        const images = await searchImages();

        if (!images || images.length === 0) {
            return res.status(404).json({ message: `Nenhuma imagem encontrada para o tipo "${type}"` });
        }
        res.status(200).json(images);

    } catch (error) {
        res.status(500).json({
            message: 'Erro em Recuperação de Imagens',
            error: error.message,
        });
    }
});
router.get('/images/:type/:id',requireAuth, async (req, res) => {
    const { type, id } = req.params;

    try {
        let image;

        if (type === 'paciente') {
            image = await prisma.imagem_paciente.findUnique({
                where: { idPaciente: id },
                select: { id: true, idPaciente: true, url: true },
            });
        } else if (type === 'medico') {
            image = await prisma.imagem_medico.findUnique({
                where: { idMedico: id },
                select: { id: true, idMedico: true, url: true },
            });
        } else {
            return res.status(400).json({ message: 'Tipo inválido! Use "medico" ou "paciente"' });
        }
        if (!image) {
            return res.status(404).json({ message: 'Usuário não possui imagem de perfil.' });
        }
        res.status(200).json(image);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar imagem', error: error.message });
    }
});

router.post('/images/:type/:id',requireAuth, async (req, res) => {
    const { type, id } = req.params;
    const { imageUrl } = req.body;

    try {
        if (type === 'paciente') {
            const image = await prisma.imagem_paciente.create({
                data: { id:v4(), idPaciente: id, url: imageUrl },
            });
            res.status(201).json(image);
        } else if (type === 'medico') {
            const image = await prisma.imagem_medico.create({
                data: { id:v4(), idMedico: id, url: imageUrl },
            });
            res.status(201).json(image);
        } else {
            res.status(400).json({ message: 'Tipo Invalido!' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Falha na Associação das imagens', error: error.message });
    }
});


async function searchImages() {
    try {
        const results = await axios.get('https://api.pexels.com/v1/search',{
            headers:{
                Authorization: process.env.PEXELS_API_KEY
            },
            params: {
                query: 'Nature',
                page: 1,
                per_page: 12
            }
        })
        
        const imagens = results.data.photos
        if(imagens && imagens.length > 0) {
            return imagens.map(photo => ({
                id:  photo.id,
                url: photo.src.portrait,
            }));
        }
    } catch (error) {
        console.log('Error:',error)
        throw new Error('Erro em Recuperação de Imagens');
    }
}

module.exports = router;