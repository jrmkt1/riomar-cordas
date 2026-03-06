const fs = require('fs');
const data = JSON.parse(fs.readFileSync('riomar-scraped.json', 'utf8'));

const targets = [
    'CARRO DE MÃO',
    'CINTA CATRACA',
    'Corda K2',
    'Corda Poliamida',
    'FILME AGRÍCOLA (Lona Preta)',
    'Filme Agrícola Preto com Branco',
    'Filme Polietileno Cores',
    'Fio de Nylon para Roçadeira',
    'Fitilho Reciclado',
    'Lona Multiuso Azul'
];

const results = data.filter(item => targets.includes(item.name.trim()));

console.log(JSON.stringify(results.map(r => ({ name: r.name, img: r.images[0] })), null, 2));
