const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.get('*', async (req, res) => {
  const baseUrl = "https://calciostreaming.shop";
  const url = `${baseUrl}${req.originalUrl}`;

  try {
    const response = await fetch(url);
    let html = await response.text();

    // Rimuovi target="_blank" da tutti i link
    html = html.replace(/target=["']_blank["']/gi, '');

    // Inietta uno script per controllare la navigazione
    html += `
      <script>
        // Blocca window.open e reindirizza solo link legittimi
        window.open = function(url) {
          if (url && url.startsWith("${baseUrl}")) {
            window.location.href = url;
          }
          return null;
        };

        // Intercetta tutti i click sui link
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

        // Previeni reindirizzamenti automatici esterni
        window.addEventListener('beforeunload', (e) => {
          const currentUrl = window.location.href;
          if (!currentUrl.startsWith("${baseUrl}")) {
            e.preventDefault();
            e.returnValue = '';
          }
        });
      </script>
    `;

    res.send(html);
  } catch (error) {
    res.status(500).send('Errore nel caricamento della pagina');
  }
});

module.exports = app;
