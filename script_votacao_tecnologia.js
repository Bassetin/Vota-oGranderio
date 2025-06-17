// script_votacao_tecnologia.js (frontend para a votação de tecnologia em pagina2.html)

document.addEventListener('DOMContentLoaded', function() {
    const techOptions = document.querySelectorAll('.escolha'); // Seleciona as imagens pela classe "escolha"

    techOptions.forEach(img => {
        img.addEventListener('click', function() {
            const techName = this.dataset.time; // Pega o valor do atributo "data-time"

            if (!techName) {
                console.error("Atributo 'data-time' não encontrado na imagem clicada.");
                alert("Erro: Não foi possível identificar a tecnologia. Verifique o HTML.");
                return;
            }

            // **** NOVO: Armazena o voto de tecnologia no sessionStorage ****
            sessionStorage.setItem('techVote', techName);
            console.log('Voto de tecnologia salvo em sessionStorage:', techName);

            // **** REMOVIDO: Nenhuma comunicação com o backend para ID ou voto de tecnologia aqui ****

            // Redireciona para a página de cadastro de cliente
            window.location.href = 'cadastro_cliente.html'; 
        });
    });
});
