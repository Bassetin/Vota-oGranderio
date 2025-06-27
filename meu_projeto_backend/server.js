// server.js

// Importa os módulos necessários
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

// Cria uma instância do aplicativo Express
const app = express();
const PORT = 3000;

// Configura os middlewares para o aplicativo Express
app.use(cors());
app.use(express.json());

// Conecta ao banco de dados SQLite
// O arquivo 'votos.db' será criado na mesma pasta onde server.js está sendo executado se não existir.
const db = new sqlite3.Database('./votos.db', (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite.');

        // **** TABELA ÚNICA: users_votes (COM NOVO CAMPO 'curso_interesse') ****
        // client_id é AUTOINCREMENT. nome, email e telefone são NOT NULL (na inserção) e email/telefone UNIQUE.
        db.run(`CREATE TABLE IF NOT EXISTS users_votes (
            client_id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            telefone TEXT UNIQUE NOT NULL,
            curso_interesse TEXT,                         -- **** NOVO CAMPO: Tipo de curso de interesse ****
            team_vote TEXT,
            tech_vote TEXT,
            data_registro DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error('Erro ao criar tabela users_votes:', err.message);
            } else {
                console.log('Tabela "users_votes" verificada/criada.');
            }
        });
    }
});


// Rotas de votação (sem client_id, armazenam em sessionStorage no frontend)
// (Mantidas como stubs para organização, mas não processam votos diretamente aqui)

// --- Rota para Registrar Dados do Cliente (Agora a Principal Rota de Inserção) ---
// Recebe nome, email, telefone, team_vote, tech_vote E curso_interesse.
// Insere um novo registro COMPLETO.
app.post('/register-client', (req, res) => {
    const { nome, email, telefone, curso_interesse, team_vote, tech_vote } = req.body; // **** NOVO: curso_interesse no body ****

    // Validação de campos obrigatórios do cadastro (nome, email, telefone)
    // curso_interesse pode ser opcional ou ter validação específica no frontend
    if (!nome || !email || !telefone) {
        return res.status(400).json({ message: 'Nome, e-mail e telefone são obrigatórios.' });
    }

    db.serialize(() => {
        db.run('BEGIN TRANSACTION;');

        // 1. Verifica se o e-mail ou telefone já estão em uso.
        db.get(`SELECT client_id FROM users_votes WHERE email = ? OR telefone = ?`, [email, telefone], (err, row) => {
            if (err) {
                db.run('ROLLBACK;', () => {
                    console.error('Erro ao verificar email/telefone duplicado:', err.message);
                    return res.status(500).json({ message: 'Erro interno ao verificar dados existentes.' });
                });
                return;
            }

            if (row) {
                db.run('ROLLBACK;', () => {
                    console.warn(`Tentativa de cadastro com e-mail (${email}) ou telefone (${telefone}) já existente.`);
                    return res.status(409).json({ message: 'Usuário já existente, e-mail ou telefone já cadastrado.' });
                });
                return;
            }

            // 2. Se e-mail e telefone são únicos, insere o novo registro completo.
            // O client_id será gerado automaticamente pelo AUTOINCREMENT.
            const insertSql = `INSERT INTO users_votes (nome, email, telefone, curso_interesse, team_vote, tech_vote) VALUES (?, ?, ?, ?, ?, ?)`; // **** NOVO: curso_interesse na query ****
            db.run(insertSql, [nome, email, telefone, curso_interesse, team_vote, tech_vote], function(err) { // **** NOVO: curso_interesse no array de parâmetros ****
                if (err) {
                    db.run('ROLLBACK;', () => {
                        console.error('Erro ao inserir novo registro completo:', err.message);
                        return res.status(500).json({ message: 'Erro ao registrar cliente.' });
                    });
                    return;
                }
                
                const newClientId = this.lastID; // Pega o client_id auto-gerado
                
                db.run('COMMIT;', (commitErr) => {
                    if (commitErr) {
                        console.error('Erro no commit da transação (register-client):', commitErr.message);
                        return res.status(500).json({ message: 'Erro interno ao finalizar cadastro.' });
                    }
                    console.log(`Novo cliente registrado: ID ${newClientId}, Nome ${nome}, E-mail ${email}, Telefone ${telefone}, Curso: ${curso_interesse}`); // **** NOVO: Log do curso ****
                    res.status(201).json({ message: 'Cliente registrado com sucesso!', client_id: newClientId });
                });
            });
        });
    });
});

// --- Rota para Obter Resultados Agregados de Votos de Times ---
// Conta quantos votos cada time recebeu na coluna 'team_vote'.
app.get('/votos-times-results', (req, res) => {
    const sql = `SELECT team_vote, COUNT(*) AS total_votos FROM users_votes WHERE team_vote IS NOT NULL GROUP BY team_vote ORDER BY total_votos DESC`;
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Erro ao buscar resultados de times:', err.message);
            return res.status(500).json({ message: 'Erro ao buscar resultados de times.' });
        }
        res.status(200).json({ teamVotes: rows });
    });
});

// --- Rota para Obter Resultados Agregados de Votos de Tecnologia ---
// Conta quantos votos cada tecnologia recebeu na coluna 'tech_vote'.
app.get('/votos-tech-results', (req, res) => {
    const sql = `SELECT tech_vote, COUNT(*) AS total_votos FROM users_votes WHERE tech_vote IS NOT NULL GROUP BY tech_vote ORDER BY total_votos DESC`;
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Erro ao buscar resultados de tecnologia:', err.message);
            return res.status(500).json({ message: 'Erro ao buscar resultados de tecnologia.' });
        }
        res.status(200).json({ techVotes: rows });
    });
});

// Inicia o servidor e o faz escutar por requisições na porta definida
app.listen(PORT, () => {
    console.log(`Servidor backend rodando em http://localhost:${PORT}`);
});

// Lida com o encerramento do processo (Ctrl+C) para fechar a conexão com o banco de dados
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Conexão com o banco de dados SQLite fechada.');
        process.exit(0);
    });
});
