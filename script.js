// script.js (frontend para a votação de times - index.html)

document.addEventListener('DOMContentLoaded', function() {
    const escudos = document.querySelectorAll('.escudo-time');

    escudos.forEach(escudo => {
        escudo.addEventListener('click', function() {
            const timeVotado = this.dataset.time; 

            // **** NOVO: Armazena o voto de time no sessionStorage ****
            sessionStorage.setItem('teamVote', timeVotado);
            console.log('Voto de time salvo em sessionStorage:', timeVotado);

            // **** REMOVIDO: Nenhuma comunicação com o backend para ID ou voto de time aqui ****

            // Redireciona para a página 2 (votação de tecnologia)
            window.location.href = 'pagina2.html'; 
        });
    });
});
