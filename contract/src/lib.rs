#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, token, Address, Env, Symbol, Vec,
};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct UserAccount {
    pub address: Address,
    pub balance: i128,
    pub total_funded: i128,
    pub created_at: u64,
    pub auto_topup_enabled: bool,
    pub auto_topup_threshold: i128,
    pub auto_topup_amount: i128,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ServiceAuthorization {
    pub user: Address,
    pub service: Address,
    pub authorized: bool,
    pub rate_limit_per_minute: u32,
    pub last_request_time: u64,
    pub request_count_in_window: u32,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Transaction {
    pub id: u32,
    pub user: Address,
    pub service: Address,
    pub amount: i128,
    pub timestamp: u64,
    pub status: Symbol,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct DisputeLog {
    pub transaction_id: u32,
    pub user: Address,
    pub service: Address,
    pub claimed_amount: i128,
    pub actual_amount: i128,
    pub created_at: u64,
    pub status: Symbol,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Admin,
    NativeToken,
    User(Address),
    ServiceAuth(Address, Address), // (user, service)
    TxCounter,
    TxHistory(Address),
    Disputes(u32),
}

#[contract]
pub struct UsagePayContract;

#[contractimpl]
impl UsagePayContract {
    /// Initialize the contract with the admin and the native token address (Stellar XLM SAC)
    pub fn initialize(env: Env, admin: Address, native_token: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Contract already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::NativeToken, &native_token);
        env.storage().instance().set(&DataKey::TxCounter, &0u32);
    }

    /// Deposit XLM into the escrow account and increment user balance in ledger storage
    pub fn fund_account(env: Env, user: Address, amount: i128) -> bool {
        if amount <= 0 {
            panic!("Amount must be greater than zero");
        }
        user.require_auth();

        let native_token: Address = env
            .storage()
            .instance()
            .get(&DataKey::NativeToken)
            .expect("Contract not initialized");

        // Transfer XLM from user to contract address
        let client = token::Client::new(&env, &native_token);
        client.transfer(&user, &env.current_contract_address(), &amount);

        // Update User account state
        let user_key = DataKey::User(user.clone());
        let mut account = if env.storage().persistent().has(&user_key) {
            let mut acc: UserAccount = env.storage().persistent().get(&user_key).unwrap();
            acc.balance += amount;
            acc.total_funded += amount;
            acc
        } else {
            UserAccount {
                address: user.clone(),
                balance: amount,
                total_funded: amount,
                created_at: env.ledger().timestamp(),
                auto_topup_enabled: false,
                auto_topup_threshold: 1_000_000, // 1 XLM in stroops (10^7 stroops = 1 XLM)
                auto_topup_amount: 5_000_000,    // 5 XLM in stroops
            }
        };

        env.storage().persistent().set(&user_key, &account);

        // Emit fund event
        env.events().publish(
            (Symbol::new(&env, "fund_account"), user),
            amount,
        );

        true
    }

    /// Authorize a service to charge the user account
    pub fn authorize_service(env: Env, user: Address, service: Address) -> bool {
        user.require_auth();

        let auth_key = DataKey::ServiceAuth(user.clone(), service.clone());
        let auth = ServiceAuthorization {
            user: user.clone(),
            service: service.clone(),
            authorized: true,
            rate_limit_per_minute: 60,
            last_request_time: env.ledger().timestamp(),
            request_count_in_window: 0,
        };

        env.storage().persistent().set(&auth_key, &auth);

        // Emit authorize event
        env.events().publish(
            (Symbol::new(&env, "authorize_service"), user),
            service,
        );

        true
    }

    /// Debit a specified user's balance and transfer funds to the calling service
    pub fn debit(env: Env, user: Address, service: Address, amount: i128) -> bool {
        if amount <= 0 {
            panic!("Amount must be greater than zero");
        }
        service.require_auth();

        let user_key = DataKey::User(user.clone());
        if !env.storage().persistent().has(&user_key) {
            panic!("User account not found");
        }
        let mut user_acc: UserAccount = env.storage().persistent().get(&user_key).unwrap();

        if user_acc.balance < amount {
            return false; // Insufficient balance
        }

        let auth_key = DataKey::ServiceAuth(user.clone(), service.clone());
        if !env.storage().persistent().has(&auth_key) {
            panic!("Service not authorized by user");
        }
        let mut auth: ServiceAuthorization = env.storage().persistent().get(&auth_key).unwrap();
        if !auth.authorized {
            panic!("Service authorization is disabled");
        }

        // Rate limit check: Fixed window of 60 seconds
        let now = env.ledger().timestamp();
        if now >= auth.last_request_time + 60 {
            auth.last_request_time = now;
            auth.request_count_in_window = 1;
        } else {
            if auth.request_count_in_window >= auth.rate_limit_per_minute {
                panic!("Rate limit exceeded");
            }
            auth.request_count_in_window += 1;
        }
        env.storage().persistent().set(&auth_key, &auth);

        // Deduct user balance
        user_acc.balance -= amount;
        env.storage().persistent().set(&user_key, &user_acc);

        // Transfer XLM to service address
        let native_token: Address = env
            .storage()
            .instance()
            .get(&DataKey::NativeToken)
            .expect("Contract not initialized");
        let client = token::Client::new(&env, &native_token);
        client.transfer(&env.current_contract_address(), &service, &amount);

        // Get transaction ID and record transaction
        let mut tx_counter: u32 = env.storage().instance().get(&DataKey::TxCounter).unwrap_or(0);
        tx_counter += 1;
        env.storage().instance().set(&DataKey::TxCounter, &tx_counter);

        let tx = Transaction {
            id: tx_counter,
            user: user.clone(),
            service: service.clone(),
            amount,
            timestamp: now,
            status: Symbol::new(&env, "completed"),
        };

        // Add to history
        let history_key = DataKey::TxHistory(user.clone());
        let mut history: Vec<Transaction> = if env.storage().persistent().has(&history_key) {
            env.storage().persistent().get(&history_key).unwrap()
        } else {
            Vec::new(&env)
        };
        history.push_front(tx); // Newest first
        // Limit history length to 50 entries
        if history.len() > 50 {
            history.pop_back();
        }
        env.storage().persistent().set(&history_key, &history);

        // Emit debit event
        env.events().publish(
            (Symbol::new(&env, "debit"), user.clone(), service),
            (amount, tx_counter),
        );

        // Internal Auto-Topup Trigger (Only triggers if enabled, user auth is needed but since it
        // might not be present during debit, this is a best-effort try which we trap internally)
        if user_acc.balance < user_acc.auto_topup_threshold && user_acc.auto_topup_enabled {
            // Note: Since this requires user's authorization and the user is not the signer of
            // this transaction, calling require_auth() will fail. We do NOT run require_auth
            // for auto_topup in this internal code block unless we have a pre-auth mechanism,
            // so we skip the call or log it. Instead, the backend reconciliation will prompt topup.
            env.events().publish(
                (Symbol::new(&env, "auto_topup_needed"), user),
                user_acc.auto_topup_amount,
            );
        }

        true
    }

    /// User manually triggers auto-topup (supplying required authorization)
    pub fn auto_topup(env: Env, user: Address) -> bool {
        user.require_auth();

        let user_key = DataKey::User(user.clone());
        if !env.storage().persistent().has(&user_key) {
            panic!("User account not found");
        }
        let mut user_acc: UserAccount = env.storage().persistent().get(&user_key).unwrap();

        if !user_acc.auto_topup_enabled {
            panic!("Auto-topup not enabled");
        }
        if user_acc.balance >= user_acc.auto_topup_threshold {
            panic!("Balance is above threshold; no topup required");
        }

        let native_token: Address = env
            .storage()
            .instance()
            .get(&DataKey::NativeToken)
            .expect("Contract not initialized");

        // Transfer funds from user's wallet to contract
        let client = token::Client::new(&env, &native_token);
        client.transfer(&user, &env.current_contract_address(), &user_acc.auto_topup_amount);

        // Update balance
        user_acc.balance += user_acc.auto_topup_amount;
        env.storage().persistent().set(&user_key, &user_acc);

        // Emit auto topup event
        env.events().publish(
            (Symbol::new(&env, "auto_topup"), user),
            user_acc.auto_topup_amount,
        );

        true
    }

    /// Withdraw remaining balance back to user's wallet
    pub fn withdraw(env: Env, user: Address, amount: i128) -> bool {
        if amount <= 0 {
            panic!("Amount must be greater than zero");
        }
        user.require_auth();

        let user_key = DataKey::User(user.clone());
        if !env.storage().persistent().has(&user_key) {
            panic!("User account not found");
        }
        let mut user_acc: UserAccount = env.storage().persistent().get(&user_key).unwrap();

        if user_acc.balance < amount {
            panic!("Insufficient balance in contract account");
        }

        user_acc.balance -= amount;
        env.storage().persistent().set(&user_key, &user_acc);

        let native_token: Address = env
            .storage()
            .instance()
            .get(&DataKey::NativeToken)
            .expect("Contract not initialized");

        // Transfer funds from contract back to user's wallet
        let client = token::Client::new(&env, &native_token);
        client.transfer(&env.current_contract_address(), &user, &amount);

        // Emit withdraw event
        env.events().publish(
            (Symbol::new(&env, "withdraw"), user),
            amount,
        );

        true
    }

    /// Read-only balance check
    pub fn get_balance(env: Env, user: Address) -> i128 {
        let user_key = DataKey::User(user);
        if env.storage().persistent().has(&user_key) {
            let user_acc: UserAccount = env.storage().persistent().get(&user_key).unwrap();
            user_acc.balance
        } else {
            0
        }
    }

    /// Read-only user account details retrieval
    pub fn get_user_account(env: Env, user: Address) -> Option<UserAccount> {
        let user_key = DataKey::User(user);
        if env.storage().persistent().has(&user_key) {
            Some(env.storage().persistent().get(&user_key).unwrap())
        } else {
            None
        }
    }

    /// Configure auto-topup settings for a user
    pub fn configure_auto_topup(
        env: Env,
        user: Address,
        enabled: bool,
        threshold: i128,
        amount: i128,
    ) -> bool {
        user.require_auth();
        if threshold < 0 || amount <= 0 {
            panic!("Invalid threshold or amount parameters");
        }

        let user_key = DataKey::User(user.clone());
        let mut user_acc = if env.storage().persistent().has(&user_key) {
            env.storage().persistent().get(&user_key).unwrap()
        } else {
            UserAccount {
                address: user.clone(),
                balance: 0,
                total_funded: 0,
                created_at: env.ledger().timestamp(),
                auto_topup_enabled: enabled,
                auto_topup_threshold: threshold,
                auto_topup_amount: amount,
            }
        };

        user_acc.auto_topup_enabled = enabled;
        user_acc.auto_topup_threshold = threshold;
        user_acc.auto_topup_amount = amount;

        env.storage().persistent().set(&user_key, &user_acc);

        env.events().publish(
            (Symbol::new(&env, "configure_auto_topup"), user),
            (enabled, threshold, amount),
        );

        true
    }

    /// Retrieve the last transactions (up to limit) for a user
    pub fn get_transaction_history(env: Env, user: Address, limit: u32) -> Vec<Transaction> {
        let history_key = DataKey::TxHistory(user);
        if env.storage().persistent().has(&history_key) {
            let history: Vec<Transaction> = env.storage().persistent().get(&history_key).unwrap();
            let mut result = Vec::new(&env);
            let count = if history.len() < limit { history.len() } else { limit };
            for i in 0..count {
                result.push_back(history.get(i).unwrap());
            }
            result
        } else {
            Vec::new(&env)
        }
    }

    /// Configure rate limit for a service authorization
    pub fn set_rate_limit(env: Env, user: Address, service: Address, limit: u32) {
        user.require_auth();
        let auth_key = DataKey::ServiceAuth(user.clone(), service.clone());
        if !env.storage().persistent().has(&auth_key) {
            panic!("Authorization does not exist");
        }
        let mut auth: ServiceAuthorization = env.storage().persistent().get(&auth_key).unwrap();
        auth.rate_limit_per_minute = limit;
        env.storage().persistent().set(&auth_key, &auth);

        env.events().publish(
            (Symbol::new(&env, "set_rate_limit"), user, service),
            limit,
        );
    }

    /// File a dispute regarding a transaction ID
    pub fn report_dispute(env: Env, user: Address, tx_id: u32, claimed_amount: i128) {
        user.require_auth();

        let dispute_key = DataKey::Disputes(tx_id);
        if env.storage().persistent().has(&dispute_key) {
            panic!("Dispute already reported for this transaction");
        }

        // We locate the service address from the tx history if possible. For simplicity, we create a basic dispute record
        let dispute = DisputeLog {
            transaction_id: tx_id,
            user: user.clone(),
            service: env.current_contract_address(), // Fallback address
            claimed_amount,
            actual_amount: 0,
            created_at: env.ledger().timestamp(),
            status: Symbol::new(&env, "open"),
        };

        env.storage().persistent().set(&dispute_key, &dispute);

        env.events().publish(
            (Symbol::new(&env, "dispute_reported"), user, tx_id),
            claimed_amount,
        );
    }
}
