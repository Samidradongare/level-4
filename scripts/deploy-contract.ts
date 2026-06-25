import { Keypair, rpc, TransactionBuilder, Operation, Networks, StrKey } from "@stellar/stellar-sdk";
import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";

// Load backend environmental secrets
dotenv.config({ path: path.resolve(__dirname, "../backend/.env") });

const SOROBAN_RPC_URL = process.env.SOROBAN_RPC_URL || "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE = Networks.TESTNET;

async function deployContract(): Promise<string> {
  const contractPath = path.resolve(__dirname, "../contract/target/wasm32-unknown-unknown/release/usage_pay_contract.wasm");
  
  if (!fs.existsSync(contractPath)) {
    throw new Error(`WASM contract binary not found at: ${contractPath}. Please compile the contract using: cargo build --target wasm32-unknown-unknown --release`);
  }

  const contractBinary = fs.readFileSync(contractPath);

  const deployerSecretKey = process.env.SERVICE_PRIVATE_KEY;
  if (!deployerSecretKey || deployerSecretKey.startsWith("SDXX")) {
    throw new Error("Invalid or missing SERVICE_PRIVATE_KEY in backend/.env.");
  }
  const deployerKeypair = Keypair.fromSecret(deployerSecretKey);

  // Initialize RPC Server connection
  const server = new rpc.Server(SOROBAN_RPC_URL);

  console.log(`Checking account status for: ${deployerKeypair.publicKey()}`);
  const account = await server.getLedgerEntries(); // checking active ledger entry

  // Fetch current account transaction sequence
  const horizonUrl = process.env.STELLAR_NETWORK === "PUBLIC" 
    ? "https://horizon.stellar.org" 
    : "https://horizon-testnet.stellar.org";
  
  const accountResponse = await fetch(`${horizonUrl}/accounts/${deployerKeypair.publicKey()}`);
  if (!accountResponse.ok) {
    throw new Error(`Stellar account ${deployerKeypair.publicKey()} not found on network. Please fund it first using Friendbot.`);
  }
  const accountData = await accountResponse.json();
  const sourceAccount = new TransactionBuilder.SourceAccount(
    deployerKeypair.publicKey(),
    accountData.sequence
  );

  console.log("1. Uploading WASM binary contract code to Soroban Testnet...");
  
  const uploadOp = Operation.invokeHostFunction({
    func: rpc.xdr.HostFunction.hostFunctionTypeUploadWasm(contractBinary),
    auth: []
  });

  const uploadTx = new TransactionBuilder(sourceAccount, {
    fee: "500000", // Adequate fee for upload operation
    networkPassphrase: NETWORK_PASSPHRASE,
  })
  .addOperation(uploadOp)
  .setTimeout(30)
  .build();

  uploadTx.sign(deployerKeypair);
  
  const uploadResult = await server.sendTransaction(uploadTx);
  if (uploadResult.status === "ERROR") {
    throw new Error(`WASM Upload request rejected: ${JSON.stringify(uploadResult.errorResultXdr)}`);
  }

  console.log(`Transaction sent successfully. TX Hash: ${uploadResult.hash}`);
  
  // Poll transaction status
  let uploadResponse = await server.getTransaction(uploadResult.hash);
  while (uploadResponse.status === "PENDING") {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    uploadResponse = await server.getTransaction(uploadResult.hash);
  }

  if (uploadResponse.status === "FAILED") {
    throw new Error(`Upload transaction failed on-chain.`);
  }

  // Parse result to locate WASM ID
  const wasmHash = uploadResponse.returnValue?.bytes().toString("hex");
  if (!wasmHash) {
    throw new Error("Failed to extract WASM hash from transaction receipt.");
  }
  console.log(`✅ WASM uploaded successfully. WASM Hash: ${wasmHash}`);

  // Create contract instance
  console.log("2. Instantiating Contract instance...");
  
  // Refresh sequence number
  const nextSeq = (BigInt(accountData.sequence) + 1n).toString();
  const sourceAccountInstance = new TransactionBuilder.SourceAccount(
    deployerKeypair.publicKey(),
    nextSeq
  );

  const createOp = Operation.invokeHostFunction({
    func: rpc.xdr.HostFunction.hostFunctionTypeCreateContract(
      new rpc.xdr.ContractIdPreimage({
        type: rpc.xdr.ContractIdPreimageType.contractIdPreimageFromAddress(
          new rpc.xdr.ContractIdPreimageFromAddress({
            address: deployerKeypair.xdrPublicKey(),
            salt: Buffer.alloc(32) // zero salt
          })
        )
      }),
      rpc.xdr.ContractExecutable.contractExecutableWasm(Buffer.from(wasmHash, "hex"))
    ),
    auth: []
  });

  const instanceTx = new TransactionBuilder(sourceAccountInstance, {
    fee: "200000",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
  .addOperation(createOp)
  .setTimeout(30)
  .build();

  instanceTx.sign(deployerKeypair);

  const instanceResult = await server.sendTransaction(instanceTx);
  console.log(`Transaction sent successfully. TX Hash: ${instanceResult.hash}`);

  let instanceResponse = await server.getTransaction(instanceResult.hash);
  while (instanceResponse.status === "PENDING") {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    instanceResponse = await server.getTransaction(instanceResult.hash);
  }

  if (instanceResponse.status === "FAILED") {
    throw new Error("Contract instantiation failed.");
  }

  const contractAddressXdr = instanceResponse.returnValue?.address();
  if (!contractAddressXdr) {
    throw new Error("Failed to extract contract address from transaction receipt.");
  }
  
  const contractId = StrKey.encodeContract(contractAddressXdr.contractId());

  console.log(`✅ Contract deployed successfully!`);
  console.log(`Contract Address: ${contractId}`);

  // Write contract address to root files
  fs.writeFileSync(path.resolve(__dirname, "../.contract-address"), contractId);
  console.log(`Address saved to .contract-address file.`);

  return contractId;
}

deployContract()
  .then((addr) => {
    console.log("\n=============================================");
    console.log("✅ SUCCESS!");
    console.log(`Deployed Contract ID: ${addr}`);
    console.log("Make sure to update backend/.env and frontend/.env variables:");
    console.log(`CONTRACT_ADDRESS=${addr}`);
    console.log("=============================================");
  })
  .catch((err) => {
    console.error("❌ Contract deployment failed:", err);
    process.exit(1);
  });
