const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: './config.env' });
const port = process.env.PORT || 8000;

const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB)
  .then(() => {})
  .catch((err) => console.error('DB connection error:', err));

app.listen(port, () => {
  console.log('Server is running on port :', port);
});
