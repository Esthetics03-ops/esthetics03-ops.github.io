const express = require('express');
const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://esthetics03-ops.github.io");
  next();
});
