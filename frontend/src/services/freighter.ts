

// Interface matching Freighter global injection
export interface FreighterAPI {
  isConnected: () => Promise<boolean>;
  getPublicKey: () => Promise<string>;
  signMessage: (message: string, opts?: { address?: string }) => Promise<string>;
  signTransaction: (xdr: string, opts?: { network?: string; networkPassphrase?: string }) => Promise<string>;
}

// Memory cache for mock wallet in simulated mode
let mockWalletAddress = '';

export class FreighterWalletService {
  /**
   * Check if Freighter extension is installed in browser
   */
  isExtensionAvailable(): boolean {
    const win = window as any;
    return !!(win.stellarFreighter || (win.freighterApi && win.freighterApi.isConnected));
  }

  /**
   * Return the Freighter API object if available
   */
  private getApi(): any {
    const win = window as any;
    return win.stellarFreighter || win.freighterApi;
  }

  /**
   * Retrieve active wallet public address
   */
  async getAddress(): Promise<string> {
    if (!this.isExtensionAvailable()) {
      // Return simulated key if not available
      if (!mockWalletAddress) {
        mockWalletAddress = 'GA' + Array.from({ length: 54 }, () => 
          'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'[Math.floor(Math.random() * 32)]
        ).join('');
      }
      return mockWalletAddress;
    }

    try {
      const api = this.getApi();
      const address = await api.getPublicKey();
      return address;
    } catch (error: any) {
      throw new Error(`Freighter error retrieving public key: ${error.message}`);
    }
  }

  /**
   * Sign sign-in messages for cryptographic login authentication
   */
  async signLoginMessage(message: string, userAddress: string): Promise<string> {
    if (!this.isExtensionAvailable()) {
      // Sim mode returns a recognizable placeholder string
      return 'mock-signature';
    }

    try {
      const api = this.getApi();
      
      // Different versions of Freighter support different signMessage inputs
      let signature = '';
      if (api.signMessage) {
        // Some Freighter API versions take (message, { address })
        signature = await api.signMessage(message, { address: userAddress });
      } else if (api.signBlob) {
        // Older versions
        const blob = btoa(message);
        const signed = await api.signBlob(blob, { address: userAddress });
        signature = signed.signature || signed;
      } else {
        throw new Error('Freighter does not support signMessage on this browser.');
      }
      
      return signature;
    } catch (error: any) {
      throw new Error(`Failed to sign authorization message: ${error.message}`);
    }
  }

  /**
   * Sign Stellar transaction envelopes (for funding / withdraws)
   */
  async signTx(xdr: string, network: string = 'TESTNET'): Promise<string> {
    if (!this.isExtensionAvailable()) {
      return xdr; // Simulated bypass
    }

    try {
      const api = this.getApi();
      const signedXdr = await api.signTransaction(xdr, { network });
      return signedXdr;
    } catch (error: any) {
      throw new Error(`Transaction signing canceled by user: ${error.message}`);
    }
  }
}

export const freighterWallet = new FreighterWalletService();
