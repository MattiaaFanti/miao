const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const baseUrl = "https://miao-mbpl.vercel.app";  // Dominio corretto
  const url = `${baseUrl}${req.url}`;

  // Evita che l'URL di richiesta venga trattato come un link pubblicitario
  if (req.url.includes('miao-mbpl.vercel.app')) {
    res.status(400).send('Richiesta non valida');
    return;
  }

  try {
    const response = await fetch(url);
    let html = await response.text();

    // Rimuovi target="_blank" da tutti i link
    html = html.replace(/target=["']_blank["']/gi, '');

    // Inietta uno script per controllare la navigazione
    html += `
      <script>
        window.open = function(url) {
          if (url && url.startsWith("${baseUrl}")) {
            window.location.href = url;
          }
          return null;
        };

        document.addEventListener('click', (e) => {
          const link = e.target.closest('a');
          if (link && link.href) {
            e.preventDefault();
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
