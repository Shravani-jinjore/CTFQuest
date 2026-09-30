require('dotenv').config({ path: '../.env' });
const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`CTFQuest backend listening on http://localhost:${PORT}`);
});