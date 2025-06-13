// server.js

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Conecta ao banco de dados SQLite
// O arquivo 'votos.db' será criado na mesma pasta se não existir
const db = new sqlite3.Database('./votos.db', (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite.');
        // **** MUDANÇA AQUI: NOVA ESTRUTURA DA TABELA ****
        // A tabela agora se chama 'contagem_votos' e tem 'nome_time' e 'total_votos'
        db.run(`CREATE TABLE IF NOT EXISTS contagem_votos (
            nome_time TEXT PRIMARY KEY,
            total_votos INTEGER DEFAULT 0
        )`, (err) => {
            if (err) {
                console.error('Erro ao criar tabela contagem_votos:', err.message);
            } else {
                console.log('Tabela "contagem_votos" verificada/criada.');
            }
        });
    }
});

// Rota para registrar um voto
app.post('/votar', (req, res) => {
    const { time } = req.body; // Pega o time enviado no corpo da requisição JSON

    if (!time) {
        return res.status(400).json({ message: 'Time não fornecido.' });
    }

    // **** MUDANÇA AQUI: Lógica de INSERIR OU ATUALIZAR ****
    // 1. Tenta inserir o time com 0 votos. Se o time já existir, IGNORA a inserção.
    const insertSql = `INSERT OR IGNORE INTO contagem_votos (nome_time, total_votos) VALUES (?, 0)`;
    db.run(insertSql, [time], function(err) {
        if (err) {
            console.error('Erro ao inserir time inicialmente:', err.message);
            return res.status(500).json({ message: 'Erro ao registrar voto.' });
        }

        // 2. Sempre atualiza o contador de votos para o time.
        const updateSql = `UPDATE contagem_votos SET total_votos = total_votos + 1 WHERE nome_time = ?`;
        db.run(updateSql, [time], function(err) {
            if (err) {
                console.error('Erro ao atualizar voto:', err.message);
                return res.status(500).json({ message: 'Erro ao registrar voto.' });
            }
            
            // **** MUDANÇA AQUI: Nova consulta para pegar o total atual ****
            const selectTotalSql = `SELECT total_votos FROM contagem_votos WHERE nome_time = ?`;
            db.get(selectTotalSql, [time], (selectErr, row) => {
                if (selectErr) {
                    console.error('Erro ao buscar total de votos após atualização:', selectErr.message);
                    return res.status(500).json({ message: 'Erro ao registrar voto (falha ao buscar total).' });
                }
                const novoTotal = row ? row.total_votos : 0;
                console.log(`Voto registrado para: ${time}. Novo total: ${novoTotal}`); 
                res.status(200).json({ message: 'Voto registrado com sucesso!', timeVotado: time, novoTotal: novoTotal });
            });
        });
    });
});

// Rota para obter a contagem de votos por time (já estava quase pronta, só ajustamos o nome da tabela)
app.get('/votos', (req, res) => {
    // Consulta SQL: Seleciona nome_time e total_votos da nova tabela
    const sql = `SELECT nome_time, total_votos FROM contagem_votos ORDER BY total_votos DESC`;
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Erro ao buscar contagem de votos:', err.message);
            return res.status(500).json({ message: 'Erro ao buscar contagem de votos.' });
        }
        // Retorna a contagem de votos por time
        res.status(200).json({ votosPorTime: rows });
    });
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor backend rodando em http://localhost:${PORT}`);
});

// Fechar o banco de dados quando o aplicativo for encerrado (boa prática)
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Conexão com o banco de dados SQLite fechada.');
        process.exit(0);
    });
});
