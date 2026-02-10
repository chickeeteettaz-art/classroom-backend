import AgentAPI from "apminsight";
AgentAPI.config()
import express from 'express';
import cors from 'cors';
import SubjectsRouter from "./db/routes/subjects.js";
import DepartmentsRouter from "./db/routes/departments.js";
import EnrollmentsRouter from "./db/routes/enrollments.js";
import UsersRouter from "./db/routes/users.js";
import securityMiddleware from "./middleware/security.js";
import {toNodeHandler} from "better-auth/node";
import {auth} from "./lib/auth.js";
import ClassesRouter from "./db/routes/classes.js";
import DashboardRouter from "./db/routes/dashboard.js";

const app = express();
const port = 8000;

if(!process.env.FRONTEND_URL) throw new Error("Missing FRONTEND_URL");

app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods:['GET','POST','PUT','DELETE'],
  credentials: true
}))

app.all('/api/auth/*splat', toNodeHandler(auth));

app.use(express.json());

app.use(securityMiddleware)

app.use('/api/subjects',SubjectsRouter)
app.use('/api/departments', DepartmentsRouter)
app.use('/api/enrollments', EnrollmentsRouter)
app.use('/api/users', UsersRouter)
app.use('/api/classes', ClassesRouter)
app.use('/api/dashboard', DashboardRouter)

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Classroom API' });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
