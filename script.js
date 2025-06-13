// script.js (frontend)

// Garante que o script só rode depois que o HTML estiver totalmente carregado
document.addEventListener('DOMContentLoaded', function() {
    // Seleciona todas as imagens que têm a classe 'escudo-time'
    const escudos = document.querySelectorAll('.escudo-time');

    // Itera sobre cada escudo encontrado e adiciona um "ouvinte de evento" de clique
    escudos.forEach(escudo => {
        escudo.addEventListener('click', function() {
            // Pega o valor do atributo 'data-time' da imagem clicada (ex: 'flamengo')
            const timeVotado = this.dataset.time; 

            // URL do seu endpoint no servidor backend para registrar o voto
            // Certifique-se de que o seu servidor Node.js esteja rodando na porta 3000
            const urlDoServidor = 'http://localhost:3000/votar'; 

            // Configurações para a requisição HTTP (método POST, tipo de conteúdo, e o corpo da requisição)
            const opcoes = {
                method: 'POST', // Usamos POST para enviar dados
                headers: {
                    'Content-Type': 'application/json' // Informa que estamos enviando JSON
                },
                body: JSON.stringify({ time: timeVotado }) // Converte o objeto JavaScript para uma string JSON
            };

            // Envia a requisição para o servidor usando a Fetch API
            fetch(urlDoServidor, opcoes)
                .then(response => {
                    // Verifica se a resposta do servidor foi bem-sucedida (status HTTP 2xx)
                    if (!response.ok) {
                        // Se houver um erro (ex: 400, 500), tenta ler a mensagem de erro do servidor
                        return response.json().then(err => { 
                            throw new Error(err.message || `Erro HTTP! Status: ${response.status}`); 
                        });
                    }
                    // Se a resposta for OK, converte o corpo da resposta para JSON
                    return response.json(); 
                })
                .then(data => {
                    // Este bloco é executado se a requisição foi bem-sucedida
                    console.log('Voto registrado com sucesso:', data);
                    // Após o voto ser registrado, redireciona o usuário para a próxima página
                    window.location.href = '/home/raul/Área de Trabalho/com.app.estacio/pagina2.html'; // Substitua pela URL da sua página de resultados
                })
                .catch(error => {
                    // Este bloco é executado se houve algum erro na requisição ou na resposta
                    console.error('Erro ao registrar voto:', error);
                    // Mostra um alerta amigável para o usuário
                    alert('Houve um erro ao registrar seu voto. Tente novamente ou verifique o console para detalhes.');
                });
        });
    });
});
