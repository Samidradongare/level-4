import { rpc, Networks, Horizon } from '@stellar/stellar-sdk';
import { env } from './env';
import { logger } from '../utils/logger';

let rpcServer: rpc.Server;
let horizonServer: Horizon.Server;
let networkPassphrase = Networks.TESTNET;

try {
  rpcServer = new rpc.Server(env.SOROBAN_RPC_URL);
  horizonServer = new Horizon.Server(
    env.STELLAR_NETWORK === 'PUBLIC'
      ? 'https://horizon.stellar.org'
      : 'https://horizon-testnet.stellar.org'
  );

  if (env.STELLAR_NETWORK === 'PUBLIC') {
    networkPassphrase = Networks.PUBLIC;
  }

  logger.info(`Stellar config initialized for network: ${env.STELLAR_NETWORK}`);
} catch (error: any) {
  logger.error(`Stellar SDK config failed: ${error.message}`);
  // Fallback mocks
  rpcServer = {} as any;
  horizonServer = {} as any;
}

export { rpcServer, horizonServer, networkPassphrase };
export const CONTRACT_ADDRESS = env.CONTRACT_ADDRESS;
export const SERVICE_WALLET_ADDRESS = env.SERVICE_WALLET_ADDRESS;
export const SERVICE_PRIVATE_KEY = env.SERVICE_PRIVATE_KEY;
export const COST_PER_SUMMARY_STROOPS = env.COST_PER_SUMMARY_STROOPS;
