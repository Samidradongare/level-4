import { Keypair, TransactionBuilder, xdr, Contract, Address, scVal } from '@stellar/stellar-sdk';
import { rpcServer, networkPassphrase, CONTRACT_ADDRESS, SERVICE_PRIVATE_KEY } from '../config/stellar';
import { logger } from '../utils/logger';
import { env } from '../config/env';

// Memory fallback store for on-chain balances and transactions in mock mode
const mockLedgerBalances: Record<string, number> = {};
const mockLedgerTxs: any[] = [];
let mockTxCounter = 1000;

export class SorobanService {
  private isMockMode: boolean;

  constructor() {
    // If no contract address or service key is provided, we default to mock mode
    this.isMockMode = !CONTRACT_ADDRESS || !SERVICE_PRIVATE_KEY || SERVICE_PRIVATE_KEY.startsWith('SDXX') || env.OPENAI_API_KEY === 'mock-key-for-development';
    if (this.isMockMode) {
      logger.info('SorobanService is running in SIMULATION/MOCK mode.');
    } else {
      logger.info(`SorobanService is configured for contract: ${CONTRACT_ADDRESS}`);
    }
  }

  /**
   * Fetch current account balance from Soroban contract
   */
  async getBalance(userAddress: string): Promise<number> {
    if (this.isMockMode) {
      return mockLedgerBalances[userAddress] || 100000000; // Default 10 XLM (10^7 stroops = 1 XLM, so 10^8 stroops = 10 XLM)
    }

    try {
      const contract = new Contract(CONTRACT_ADDRESS);
      const userScVal = Address.fromString(userAddress).toScVal();
      
      const response = await rpcServer.simulateTransaction(
        new TransactionBuilder(
          await rpcServer.getLatestLedger(),
          { fee: '100' }
        )
        .addOperation(
          contract.call('get_balance', userScVal)
        )
        .build()
      );

      if (rpc.Api.isSimulationSuccess(response)) {
        const resultVal = response.result?.retval;
        if (resultVal) {
          // Parse i128 ScVal to number
          return Number(xdr.ScVal.fromXDR(resultVal.toXDR()).i128().lo());
        }
      }
      return 0;
    } catch (error: any) {
      logger.error(`Soroban getBalance RPC error: ${error.message}. Returning fallback.`);
      return mockLedgerBalances[userAddress] || 0;
    }
  }

  /**
   * Call debit() on the Soroban contract to bill the user
   */
  async debit(
    userAddress: string,
    serviceAddress: string,
    amountStroops: number
  ): Promise<{ txId: string; success: boolean }> {
    if (this.isMockMode) {
      const currentBalance = await this.getBalance(userAddress);
      if (currentBalance < amountStroops) {
        logger.warn(`Mock Debit failed: Insufficient balance for ${userAddress}. Need ${amountStroops}, have ${currentBalance}`);
        return { txId: '', success: false };
      }
      
      // Update mock balance
      mockLedgerBalances[userAddress] = currentBalance - amountStroops;
      mockLedgerBalances[serviceAddress] = (mockLedgerBalances[serviceAddress] || 0) + amountStroops;
      
      const mockTxId = `tx_hash_sim_${++mockTxCounter}_${Math.floor(Math.random() * 900000 + 100000)}`;
      mockLedgerTxs.push({
        id: mockTxCounter,
        user: userAddress,
        service: serviceAddress,
        amount: amountStroops,
        timestamp: Math.floor(Date.now() / 1000),
        status: 'completed',
        tx_hash: mockTxId
      });

      logger.info(`Mock Debit success: billed ${userAddress} ${amountStroops} stroops. New balance: ${mockLedgerBalances[userAddress]}`);
      return { txId: mockTxId, success: true };
    }

    try {
      const serviceKeypair = Keypair.fromSecret(SERVICE_PRIVATE_KEY);
      const contract = new Contract(CONTRACT_ADDRESS);
      
      const userSc = Address.fromString(userAddress).toScVal();
      const serviceSc = Address.fromString(serviceAddress).toScVal();
      const amountSc = scVal.fromI128(xdr.Int128Parts.fromInt(amountStroops));

      const tx = new TransactionBuilder(
        await rpcServer.getLatestLedger(),
        {
          fee: '10000',
          networkPassphrase,
        }
      )
      .addOperation(
        contract.call('debit', userSc, serviceSc, amountSc)
      )
      .setTimeout(30)
      .build();

      tx.sign(serviceKeypair);
      
      // Send transaction
      const response = await rpcServer.sendTransaction(tx);
      if (response.status === 'PENDING') {
        let status = response.status;
        let txResult;
        
        // Poll for result
        for (let i = 0; i < 10; i++) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          const poll = await rpcServer.getTransaction(response.hash);
          status = poll.status;
          if (status === 'SUCCESS') {
            txResult = poll;
            break;
          } else if (status === 'FAILED') {
            break;
          }
        }

        if (status === 'SUCCESS' && txResult) {
          logger.info(`Soroban debit contract tx succeeded: ${response.hash}`);
          return { txId: response.hash, success: true };
        }
      }
      
      logger.error(`Soroban debit failed or timed out: status ${response.status}`);
      return { txId: '', success: false };
    } catch (error: any) {
      logger.error(`Soroban debit blockchain failure: ${error.message}`);
      return { txId: '', success: false };
    }
  }

  /**
   * Get transaction history for user from contract ledger
   */
  async getTransactionHistory(userAddress: string, limit: number = 20): Promise<any[]> {
    if (this.isMockMode) {
      return mockLedgerTxs
        .filter(t => t.user === userAddress || t.service === userAddress)
        .slice(-limit)
        .reverse();
    }

    try {
      const contract = new Contract(CONTRACT_ADDRESS);
      const userScVal = Address.fromString(userAddress).toScVal();
      const limitScVal = scVal.fromU32(limit);
      
      const response = await rpcServer.simulateTransaction(
        new TransactionBuilder(
          await rpcServer.getLatestLedger(),
          { fee: '100' }
        )
        .addOperation(
          contract.call('get_transaction_history', userScVal, limitScVal)
        )
        .build()
      );

      if (rpc.Api.isSimulationSuccess(response)) {
        const resultVal = response.result?.retval;
        if (resultVal) {
          // Parse transaction array
          const vec = resultVal.vec();
          if (vec) {
            return vec.map((item: any) => {
              const obj = item.obj();
              return {
                id: obj.id().u32(),
                user: obj.user().address().toString(),
                service: obj.service().address().toString(),
                amount: Number(obj.amount().i128().lo()),
                timestamp: Number(obj.timestamp().u64()),
                status: obj.status().sym().toString()
              };
            });
          }
        }
      }
      return [];
    } catch (error: any) {
      logger.error(`Soroban getTransactionHistory RPC error: ${error.message}. Returning mock cache.`);
      return mockLedgerTxs.filter(t => t.user === userAddress).reverse();
    }
  }

  /**
   * Helper to set mock balance for testing
   */
  setMockBalance(userAddress: string, amountStroops: number) {
    mockLedgerBalances[userAddress] = amountStroops;
    logger.info(`Set mock ledger balance for ${userAddress} to ${amountStroops} stroops.`);
  }

  /**
   * Helper to add a mock transaction for testing
   */
  addMockTransaction(userAddress: string, serviceAddress: string, amountStroops: number, status: string = 'completed') {
    const mockTxId = `tx_hash_sim_${++mockTxCounter}_${Math.floor(Math.random() * 900000 + 100000)}`;
    mockLedgerTxs.push({
      id: mockTxCounter,
      user: userAddress,
      service: serviceAddress,
      amount: amountStroops,
      timestamp: Math.floor(Date.now() / 1000),
      status,
      tx_hash: mockTxId
    });
    return mockTxId;
  }
}

export const sorobanService = new SorobanService();
