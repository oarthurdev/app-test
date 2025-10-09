
import React, { createContext, useContext, useState, useEffect } from 'react';
import Constants from 'expo-constants';

interface TenantConfig {
  tenantId: number;
  tenantSlug: string;
  tenantName: string;
  primaryColor: string;
  businessType?: string;
  phone?: string;
  logo?: string;
}

interface TenantContextType {
  config: TenantConfig;
  updateTheme: (color: string) => void;
}

const defaultConfig: TenantConfig = {
  tenantId: 1,
  tenantSlug: 'default',
  tenantName: 'App',
  primaryColor: '#2563eb',
};

const TenantContext = createContext<TenantContextType>({
  config: defaultConfig,
  updateTheme: () => {},
});

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<TenantConfig>(() => {
    // Ler configuração do app.json/extra
    const extraConfig = Constants.expoConfig?.extra;
    if (extraConfig?.tenantId) {
      return {
        tenantId: extraConfig.tenantId,
        tenantSlug: extraConfig.tenantSlug,
        tenantName: extraConfig.tenantName,
        primaryColor: extraConfig.primaryColor || '#2563eb',
        businessType: extraConfig.businessType,
        phone: extraConfig.phone,
        logo: extraConfig.logo,
      };
    }
    return defaultConfig;
  });

  const updateTheme = (color: string) => {
    setConfig(prev => ({ ...prev, primaryColor: color }));
  };

  return (
    <TenantContext.Provider value={{ config, updateTheme }}>
      {children}
    </TenantContext.Provider>
  );
}

export const useTenant = () => useContext(TenantContext);
