const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const baseUrl = "https://miao-e6gi.vercel.app";  // Cambia il dominio qui
  const url = `${baseUrl}${req.url}`;  // Crea l'URL finale per la richiesta

  try {
    // Esegui la richiesta HTTP al sito da mirrorare
    const response = await fetch(url);
    let html = await response.text();

    // Rimuovi gli attributi target="_blank" dai link per evitare di aprire in nuove finestre
    html = html.replace(/target=["']_blank["']/gi, '');

    // Aggiungi uno script personalizzato per la gestione della navigazione
    html += `
      <script>
        // Reindirizza solo i link che appartengono al dominio del mirror
        window.open = function(url) {
          if (url && url.startsWith("${baseUrl}")) {
            window.location.href = url;  // Naviga all'interno del sito mirrorato
          }
          return null;  // Non fare nulla per gli altri link
        };

        document.addEventListener('click', (e) => {
          const link = e.target.closest('a');  // Trova il link cliccato
          if (link && link.href) {
            e.preventDefault();  // Blocca il comportamento di default
            if (link.href.startsWith("${baseUrl}")) {
              window.location.href = link.href;  // Naviga all'interno del sito mirrorato
            } else {
              console.log("Link pubblicitario bloccato:", link.href);  // Log per i link esterni
            }
          }
        });

        window.addEventListener('beforeunload', (e) => {
          const currentUrl = window.location.href;
          // Blocca la navigazione se non si sta uscendo dal dominio del mirror
          if (!currentUrl.startsWith("${baseUrl}")) {
            e.preventDefault();
            e.returnValue = '';  // Mostra il prompt di conferma per uscire
          }
        });
      </script>
    `;

    // Imposta l'intestazione per restituire HTML e invia il risultato
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
  } catch (error) {
    // Gestisci eventuali errori nella richiesta o nel processamento
    res.status(500).send('Errore nel caricamento della pagina');
  }
};
