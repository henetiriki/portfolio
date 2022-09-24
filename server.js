const express = require('express');
const next = require('next');
const fetch = require('node-fetch');

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  server.get('/insta/:image', async (req, res) => {
    const {
      params: { image },
    } = req;
    const response = await fetch(
      `https://s3.ap-southeast-2.amazonaws.com/ouq77.kiwi/static/insta/large/${image}`,
      {
        headers: {
          referer: 'http://localhost:3000/ouq77.kiwi',
        },
      }
    );

    if (response.ok) {
      const imageBlob = await response.blob();

      res.type(imageBlob.type);
      imageBlob.arrayBuffer().then(buf => {
        res.send(Buffer.from(buf));
      });

      return;
    }

    res.status(404).send('Image not found');
  });

  server.all('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
