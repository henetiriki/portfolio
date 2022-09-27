import express from 'express';
import next from 'next';
import fetch from 'node-fetch';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const port = parseInt(process.env.PORT, 10) || 3000;
  const server = express();

  server.get('/insta/:image', async (req, res) => {
    const {
      params: { image },
    } = req;
    const response = await fetch(`${process.env.IMAGE_HOST}/${image}`, {
      headers: {
        referer: `${process.env.NEXT_PUBLIC_HOST}/${process.env.DOMAIN}`,
      },
    });

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

  server.all('*', handle);

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
