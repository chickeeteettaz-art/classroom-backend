import express from 'express';
import cors from 'cors';
import SubjectsRouter from "./db/routes/subjects";
import securityMiddleware from "./middleware/security";

const app = express();
const port = 8000;

if(!process.env.FRONTEND_URL) throw new Error("Missing FRONTEND_URL");

app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods:['GET','POST','PUT','DELETE'],
  credentials: true
}))

app.use(express.json());

app.use(securityMiddleware)

app.use('/api/subjects',SubjectsRouter)

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Classroom API' });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
