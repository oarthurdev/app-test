// app.config.js
const fs = require('fs');

module.exports = () => {
  const empresa = JSON.parse(fs.readFileSync('./empresa.json', 'utf-8'));

  return {
    expo: {
      name: empresa.name,
      slug: empresa.slug,
      version: "1.0.0",
      orientation: "portrait",
      icon: empresa.logo || "./assets/images/icon.png",
      scheme: empresa.slug,
      userInterfaceStyle: "automatic",
      splash: {
        image: "./assets/images/splash-icon.png",
        resizeMode: "contain",
        backgroundColor: empresa.primaryColor || "#2563eb"
      },
      android: {
        package: `com.vortex.${empresa.slug.replace(/-/g, '')}`,
        adaptiveIcon: {
          foregroundImage: empresa.logo || "./assets/images/adaptive-icon.png",
          backgroundColor: empresa.primaryColor || "#2563eb"
        }
      },
      ios: {
        supportsTablet: true,
        bundleIdentifier: `com.vortex.${empresa.slug.replace(/-/g, '')}`
      },
      web: {
        bundler: "metro",
        output: "static",
        favicon: "./assets/images/favicon.png"
      },
      plugins: [
        "expo-router"
      ],
      experiments: {
        typedRoutes: true
      },
      extra: {
        tenantId: empresa.id,
        tenantSlug: empresa.slug,
        tenantName: empresa.name,
        primaryColor: empresa.primaryColor || "#2563eb",
        businessType: empresa.businessType,
        phone: empresa.phone,
        logo: empresa.logo,
        empresa,
        eas: {
          projectId: empresa.projectId
        }
      }
    }
  };
};
