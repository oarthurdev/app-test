// app.config.js
const fs = require('fs');

module.exports = () => {
  const empresa = JSON.parse(fs.readFileSync('./empresa.json', 'utf-8'));

  return {
    expo: {
      name: empresa.nome_fantasia,
      slug: empresa.slug,
      version: "1.0.0",
      android: {
        package: `com.vortex.${empresa.slug}`,
      },
      extra: {
        empresa,
      }
    }
  };
};
