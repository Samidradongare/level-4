import { Keypair, TransactionBuilder, xdr, Contract, Address, rpc } from '@stellar/stellar-sdk';
import { rpcServer, horizonServer, networkPassphrase, CONTRACT_ADDRESS, SERVICE_PRIVATE_KEY, SERVICE_WALLET_ADDRESS } from '../config/stellar';
import { logger } from '../utils/logger';
import { env } from '../config/env';

// In-memory mock store for simulation mode
const mockBalances: Record<string, number> = {};
const mockTxs: any[] = [];
let mockTxCounter = 1000;

export class SorobanService {
  private readonly isMock: boolean;

  constructor() {
    this.isMock =
      !CONTRACT_ADDRESS ||
      !SERVICE_PRIVATE_KEY ||
      SERVICE_PRIVATE_KEY.startsWith('SDXX') ||
      env.OPENAI_API_KEY === 'mock-key-for-development';
    if (this.isMock) {
      logger.info('SorobanService running in MOCK mode');
    } else {
      logger.info(`SorobanService configured for contract ${CONTRACT_ADDRESS}`);
    }
  }

  /** Retrieve user balance from the contract */
  async getBalance(userAddress: string): Promise<number> {
    if (this.isMock) {
      return mockBalances[userAddress] ?? 100000000; // default 10 XLM in stroops
    }
    try {
      const contract = new Contract(CONTRACT_ADDRESS);
      const userSc = Address.fromString(userAddress).toScVal();
      const tx = new TransactionBuilder(await horizonServer.loadAccount(SERVICE_WALLET_ADDRESS), { fee: '100' })
        .addOperation(contract.call('get_balance', userSc))
        .build();
      const sim = await rpcServer.simulateTransaction(tx);
      if (rpc.Api.isSimulationSuccess(sim)) {
        const retval = sim.result?.retval;
        if (retval) {
          const i128 = xdr.ScVal.fromXDR(retval.toXDR()).i128();
          return Number(i128.lo());
        }
      }
      return 0;
    } catch (e: any) {
      logger.error(`getBalance RPC error: ${e.message}`);
      return mockBalances[userAddress] ?? 0;
    }
  }

  /** Debit amount from user and credit service */
  async debit(
    userAddress: string,
    serviceAddress: string,
    amountStroops: number
  ): Promise<{ txId: string; success: boolean }> {
    if (this.isMock) {
      const bal = await this.getBalance(userAddress);
      if (bal < amountStroops) {
        logger.warn('Mock debit failed: insufficient funds');
        return { txId: '', success: false };
      }
      mockBalances[userAddress] = bal - amountStroops;
      mockBalances[serviceAddress] = (mockBalances[serviceAddress] ?? 0) + amountStroops;
      const mockId = `tx_hash_sim_${++mockTxCounter}_${Math.floor(Math.random() * 900000 + 100000)}`;
      mockTxs.push({
        id: mockTxCounter,
        user: userAddress,
        service: serviceAddress,
        amount: amountStroops,
        timestamp: Math.floor(Date.now() / 1000),
        status: 'completed',
        tx_hash: mockId
      });
      logger.info(`Mock debit succeeded. New balance: ${mockBalances[userAddress]}`);
      return { txId: mockId, success: true };
    }
    try {
      const serviceKey = Keypair.fromSecret(SERVICE_PRIVATE_KEY);
      const contract = new Contract(CONTRACT_ADDRESS);
      const userSc = Address.fromString(userAddress).toScVal();
      const serviceSc = Address.fromString(serviceAddress).toScVal();
      const amountSc = xdr.ScVal.scvI128(new xdr.Int128Parts({
  lo: xdr.Uint64.fromString(amountStroops.toString()),
  hi: xdr.Uint64.fromString('0')
}));
      const tx = new TransactionBuilder(await horizonServer.loadAccount(SERVICE_WALLET_ADDRESS), {
        fee: '10000',
        networkPassphrase,
      })
        .addOperation(contract.call('debit', userSc, serviceSc, amountSc))
        .setTimeout(30)
        .build();
      tx.sign(serviceKey);
      const sendResp = await rpcServer.sendTransaction(tx);
      if (sendResp.status === 'PENDING') {
        for (let i = 0; i < 10; i++) {
          await new Promise(r => setTimeout(r, 1000));
          const poll = await rpcServer.getTransaction(sendResp.hash);
          if (poll.status === 'SUCCESS') {
            logger.info(`Debit succeeded: ${sendResp.hash}`);
            return { txId: sendResp.hash, success: true };
          }
          if (poll.status === 'FAILED') break;
        }
      }
      logger.error(`Debit failed or timed out: ${sendResp.status}`);
      return { txId: '', success: false };
    } catch (e: any) {
      logger.error(`debit RPC error: ${e.message}`);
      return { txId: '', success: false };
    }
  }

  /** Retrieve transaction history for a user */
  async getTransactionHistory(userAddress: string, limit: number = 20): Promise<any[]> {
    if (this.isMock) {
      return mockTxs
        .filter(t => t.user === userAddress || t.service === userAddress)
        .slice(-limit)
        .reverse();
    }
    try {
      const contract = new Contract(CONTRACT_ADDRESS);
      const userSc = Address.fromString(userAddress).toScVal();
      const limitSc = xdr.ScVal.scvU32(limit);
      const tx = new TransactionBuilder(await horizonServer.loadAccount(SERVICE_WALLET_ADDRESS), { fee: '100' })
        .addOperation(contract.call('get_transaction_history', userSc, limitSc))
        .build();
      const sim = await rpcServer.simulateTransaction(tx);
      if (rpc.Api.isSimulationSuccess(sim)) {
        const retval = sim.result?.retval;
        if (retval) {
          const vec = retval.vec();
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
    } catch (e: any) {
      logger.error(`getTransactionHistory RPC error: ${e.message}`);
      return mockTxs.filter(t => t.user === userAddress).reverse();
    }
  }

  // Helper methods for tests / dev
  setMockBalance(address: string, stroops: number) {
    mockBalances[address] = stroops;
    logger.info(`Mock balance set for ${address}: ${stroops}`);
  }

  addMockTransaction(user: string, service: string, amount: number, status: string = 'completed') {
    const mockId = `tx_hash_sim_${++mockTxCounter}_${Math.floor(Math.random() * 900000 + 100000)}`;
    mockTxs.push({
      id: mockTxCounter,
      user,
      service,
      amount,
      timestamp: Math.floor(Date.now() / 1000),
      status,
      tx_hash: mockId
    });
    return mockId;
  }
}

export const sorobanService = new SorobanService();






























