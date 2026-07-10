import { isConnected, requestAccess, signMessage, signTransaction } from '@stellar/freighter-api';

// Memory cache for mock wallet in simulated mode
let mockWalletAddress = '';

export class FreighterWalletService {
  /**
   * Check if Freighter extension is installed in browser (synchronous check)
   */
  isExtensionAvailable(): boolean {
    const win = window as any;
    return !!(win.stellarFreighter || win.freighterApi);
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
      // First verify connection status
      const connectionStatus = await isConnected();
      if (!connectionStatus || !connectionStatus.isConnected) {
        throw new Error('Freighter extension is present but not connected. Please unlock your wallet.');
      }

      const res = await requestAccess();
      if (res.error) {
        throw new Error(res.error);
      }
      return res.address;
    } catch (error: any) {
      throw new Error(`Freighter error retrieving address: ${error.message || error}`);
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
      const res = await signMessage(message, { address: userAddress });
      if (res.error) {
        throw new Error(res.error);
      }
      
      if (!res.signedMessage) {
        throw new Error('No signature returned from Freighter.');
      }

      // Convert signedMessage to string format (or binary array to base64 if needed)
      if (typeof res.signedMessage === 'string') {
        return res.signedMessage;
      }
      if (res.signedMessage) {
        const bytes = new Uint8Array(res.signedMessage);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
      }
      throw new Error('Signed message is in an unsupported format.');
    } catch (error: any) {
      throw new Error(`Failed to sign authorization message: ${error.message || error}`);
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
      const networkPassphrase = network === 'TESTNET'
        ? 'Test SDF Network ; September 2015'
        : 'Public Global Stellar Network ; October 2015';

      const res = await signTransaction(xdr, { networkPassphrase });
      if (res.error) {
        throw new Error(res.error);
      }
      return res.signedTxXdr;
    } catch (error: any) {
      throw new Error(`Transaction signing canceled or failed: ${error.message || error}`);
    }
  }
}

export const freighterWallet = new FreighterWalletService();
