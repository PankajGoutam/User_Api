const express = require('express');
const app = express();
const userRoutes = require('./Routes/user');
const dotenv = require('dotenv');
const cors = require('cors')
const connetDB = require('./Config/connect')
dotenv.config();
app.use(express.json());
app.use(cors({
  credentials: true,
  origin: ['http://localhost:5173','http://localhost:4173','https://katnidaily.netlify.app']  
}));

app.use('/api/v1/users', userRoutes);

const PORT = process.env.PORT || 3000;
const start = async () => {
  try {
      await connetDB(process.env.MONGO_URI)
      app.listen(PORT,console.log(`server is listening on port ${PORT}...`))
  } catch (error) {
      console.log(error);
  }
}

start();
