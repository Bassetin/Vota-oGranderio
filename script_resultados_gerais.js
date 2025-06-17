// script_resultados_gerais.js (frontend para a página de resultados finais)

document.addEventListener('DOMContentLoaded', function() {
    const listaVotosTimesElemento = document.getElementById('lista-votos-times');
    const listaVotosTechElemento = document.getElementById('lista-votos-tech');
    const timerElement = document.getElementById('timer');

    // Rotas do backend para obter os resultados agregados
    const urlResultadosTimes = 'http://localhost:3000/votos-times-results';
    const urlResultadosTech = 'http://localhost:3000/votos-tech-results';

    // --- Função para buscar e exibir os resultados de Times ---
    function fetchTeamResults() {
        fetch(urlResultadosTimes)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erro HTTP! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                listaVotosTimesElemento.innerHTML = ''; // Limpa "Carregando resultados..."
                if (data.teamVotes && data.teamVotes.length > 0) {
                    data.teamVotes.forEach(voto => {
                        const listItem = document.createElement('li');
                        // Garante que o nome do time seja exibido de forma legível (ex: "flamengo" -> "Flamengo")
                        const displayName = voto.team_vote.charAt(0).toUpperCase() + voto.team_vote.slice(1);
                        listItem.innerHTML = `<span>${displayName}</span><span>${voto.total_votos}</span>`;
                        listaVotosTimesElemento.appendChild(listItem);
                    });
                } else {
                    listaVotosTimesElemento.innerHTML = '<li>Nenhum voto de time registrado ainda.</li>';
                }
            })
            .catch(error => {
                console.error('Erro ao buscar resultados de times:', error);
                listaVotosTimesElemento.innerHTML = '<li>Erro ao carregar resultados de times.</li>';
            });
    }

    // --- Função para buscar e exibir os resultados de Tecnologia ---
    function fetchTechResults() {
        fetch(urlResultadosTech)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erro HTTP! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                listaVotosTechElemento.innerHTML = ''; // Limpa "Carregando resultados..."
                if (data.techVotes && data.techVotes.length > 0) {
                    data.techVotes.forEach(voto => {
                        const listItem = document.createElement('li');
                        // Garante que o nome da tecnologia seja exibido de forma legível
                        const displayName = voto.tech_vote.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                        listItem.innerHTML = `<span>${displayName}</span><span>${voto.total_votos}</span>`;
                        listaVotosTechElemento.appendChild(listItem);
                    });
                } else {
                    listaVotosTechElemento.innerHTML = '<li>Nenhum voto de tecnologia registrado ainda.</li>';
                }
            })
            .catch(error => {
                console.error('Erro ao buscar resultados de tecnologia:', error);
                listaVotosTechElemento.innerHTML = '<li>Erro ao carregar resultados de tecnologia.</li>';
            });
    }

    // Chama as funções para buscar os resultados ao carregar a página
    fetchTeamResults();
    fetchTechResults();

    // --- Lógica do Temporizador para Redirecionamento ---
    let tempoRestante = 10; // Segundos para redirecionar (agora 7 segundos)
    if (timerElement) {
        timerElement.textContent = tempoRestante; // Atualiza o timer inicial no HTML
    }

    const countdownInterval = setInterval(() => {
        tempoRestante--;
        if (timerElement) {
            timerElement.textContent = tempoRestante;
        }
        
        if (tempoRestante <= 0) {
            clearInterval(countdownInterval); // Para o contador
            
            // **** NOVO: Limpa o client_id do localStorage antes de redirecionar ****
            localStorage.removeItem('clientId'); 
            console.log('Client ID limpo do localStorage. Nova sessão será iniciada.');

            window.location.href = 'index.html'; // Redireciona para a página inicial
        }
    }, 1000); // Atualiza a cada 1 segundo
});
