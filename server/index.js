import cors from 'cors';
import express from 'express';

const app = express();
const port = process.env.PORT ?? 4000;

app.use(
  cors({
    origin: ['http://127.0.0.1:5173', 'http://localhost:5173'],
  }),
);
app.use(express.json());

app.get('/api/health', (_request, response) => {
  response.json({
    ok: true,
    service: 'Support Request Tracker API',
  });
});

app.use((_request, response) => {
  response.status(404).json({ error: 'Not found' });
});

app.listen(port, () => {
  console.log(`Support Request Tracker API listening on http://127.0.0.1:${port}`);
});
