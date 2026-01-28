import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export type Network = 'mainnet' | 'calibration';

interface NetworkContextType {
  network: Network;
  setNetwork: (network: Network) => void;
  isMainnet: boolean;
  isCalibration: boolean;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

interface NetworkProviderProps {
  children: ReactNode;
}

export const NetworkProvider: React.FC<NetworkProviderProps> = ({ children }) => {
  const [network, setNetwork] = useLocalStorage<Network>('selectedNetwork', 'mainnet');

  const value: NetworkContextType = useMemo(() => ({
    network,
    setNetwork,
    isMainnet: network === 'mainnet',
    isCalibration: network === 'calibration',
  }), [network, setNetwork]);

  return (
    <NetworkContext.Provider value={value}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = (): NetworkContextType => {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};
