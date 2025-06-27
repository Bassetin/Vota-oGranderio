// script.js (frontend para a votação de times - index.html)

document.addEventListener('DOMContentLoaded', function() {
    let inactivityTimeout; // Variável para armazenar o timeout de inatividade
    const INACTIVITY_DELAY_SECONDS = 15; // Tempo de inatividade antes de redirecionar para os resultados

    // --- Lógica do Temporizador de Inatividade (Redireciona para Resultados) ---
    function redirectToResults() {
        console.log('Inatividade detectada na página inicial. Redirecionando para resultados...');
        // Limpa qualquer client_id antigo que possa estar no localStorage
        // para garantir que uma nova sessão (com novo ID no cadastro) seja iniciada
        localStorage.removeItem('clientId'); 
        window.location.href = 'resultados_gerais.html'; // Redireciona para a página de resultados
    }

    function resetInactivityTimer() {
        clearTimeout(inactivityTimeout); // Limpa qualquer timeout anterior
        inactivityTimeout = setTimeout(redirectToResults, INACTIVITY_DELAY_SECONDS * 1000); // Define um novo timeout
    }

    // --- Lógica de Votação de Times ---
    const escudos = document.querySelectorAll('.escudo-time');

    escudos.forEach(escudo => {
        escudo.addEventListener('click', function() {
            // Limpa o temporizador de inatividade quando o usuário interage
            clearTimeout(inactivityTimeout);

            const timeVotado = this.dataset.time; 

            // **** NOVO: Armazena o voto de time no sessionStorage (não no backend ainda) ****
            sessionStorage.setItem('teamVote', timeVotado);
            console.log('Voto de time salvo em sessionStorage:', timeVotado);

            // Redireciona para a página 2 (votação de tecnologia)
            window.location.href = 'pagina2.html'; 
        });
    });

    // Inicia o temporizador de inatividade quando a página é carregada
    resetInactivityTimer();

    // Adiciona ouvintes de evento para resetar o temporizador de inatividade
    document.addEventListener('mousemove', resetInactivityTimer);
    document.addEventListener('keypress', resetInactivityTimer);
    document.addEventListener('click', resetInactivityTimer);
    document.addEventListener('touchstart', resetInactivityTimer); // Para dispositivos móveis
});
