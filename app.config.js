// app.config.js
const fs = require('fs');

module.exports = () => {
  const empresa = JSON.parse(fs.readFileSync('./empresa.json', 'utf-8'));

  return {
    expo: {
      name: empresa.name,
      slug: empresa.slug,
      version: "1.0.0",
      android: {
        package: "com.vortex.agendamento"
      },
      extra: {
        empresa,
        eas: {
          projectId: empresa.projectId
        }
      }
    }
  };
};
