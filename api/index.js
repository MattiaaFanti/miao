const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const baseUrl = "https://miao";  // URL del tuo sito su Vercel
  const requestedUrl = `https://${req.headers.host}${req.url}`;

  // Controllo per evitare il mirror su se stesso
  if (requestedUrl.startsWith(baseUrl)) {
    // Se la richiesta è per il sito di Vercel, non fare il mirror
    res.status(404).send('Pagina non trovata');
    return;
  }

  const url = `${baseUrl}${req.url}`;

  try {
    const response = await fetch(url);
    let html = await response.text();

    // Rimuovi target="_blank" da tutti i link
    html = html.replace(/target=["']_blank["']/gi, '');

    // Inietta uno script per controllare la navigazione
    html += `
      <script>
        window.open = function(url) {
          // Permetti solo i link che iniziano con ${baseUrl}
          if (url && url.startsWith("${baseUrl}")) {
            window.location.href = url;
          }
          return null;
        };

        document.addEventListener('click', (e) => {
          const link = e.target.closest('a');
          if (link && link.href) {
            e.preventDefault();
            // Permetti solo i link che iniziano con ${baseUrl}
            if (link.href.startsWith("${baseUrl}")) {
              window.location.href = link.href;
            } else {
              console.log("Link pubblicitario bloccato:", link.href);
            }
          }
        });

        window.addEventListener('beforeunload', (e) => {
          const currentUrl = window.location.href;
          if (!currentUrl.startsWith("${baseUrl}")) {
            e.preventDefault();
            e.returnValue = '';
          }
        });
      </script>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
  } catch (error) {
    res.status(500).send('Errore nel caricamento della pagina');
  }
};
