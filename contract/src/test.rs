#![cfg(test)]
use super::*;
use soroban_sdk::{
    testutils::{Address as _, Ledger},
    token, Address, Env,
};

#[test]
fn test_initialize_and_fund() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let user = Address::generate(&env);
    let service = Address::generate(&env);

    // Register token contract to represent native XLM
    let token_admin = Address::generate(&env);
    let token_contract_id = env.register_stellar_asset_contract(token_admin.clone());
    let token_admin_client = token::StellarAssetClient::new(&env, &token_contract_id);
    token_admin_client.mint(&user, &10_000_000);
    let token_client = token::Client::new(&env, &token_contract_id);

    // Register our contract
    let contract_id = env.register_contract(None, UsagePayContract);
    let client = UsagePayContractClient::new(&env, &contract_id);

    client.initialize(&admin, &token_contract_id);

    // Fund the account
    assert!(client.fund_account(&user, &5_000_000));
    assert_eq!(client.get_balance(&user), 5_000_000);

    // Check account storage
    let account = client.get_user_account(&user).unwrap();
    assert_eq!(account.balance, 5_000_000);
    assert_eq!(account.total_funded, 5_000_000);
    assert_eq!(account.auto_topup_enabled, false);

    // Authorize service
    assert!(client.authorize_service(&user, &service));

    // Debit service
    assert!(client.debit(&user, &service, &1_000_000));
    assert_eq!(client.get_balance(&user), 4_000_000);
    assert_eq!(token_client.balance(&service), 1_000_000);

    // Withdraw
    assert!(client.withdraw(&user, &2_000_000));
    assert_eq!(client.get_balance(&user), 2_000_000);

    // Check transaction history
    let history = client.get_transaction_history(&user, &10);
    assert_eq!(history.len(), 1);
    assert_eq!(history.get(0).unwrap().amount, 1_000_000);
}

#[test]
#[should_panic(expected = "Rate limit exceeded")]
fn test_rate_limiting() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let user = Address::generate(&env);
    let service = Address::generate(&env);

    let token_admin = Address::generate(&env);
    let token_contract_id = env.register_stellar_asset_contract(token_admin.clone());
    let token_admin_client = token::StellarAssetClient::new(&env, &token_contract_id);
    token_admin_client.mint(&user, &10_000_000);
    let token_client = token::Client::new(&env, &token_contract_id);

    let contract_id = env.register_contract(None, UsagePayContract);
    let client = UsagePayContractClient::new(&env, &contract_id);

    client.initialize(&admin, &token_contract_id);
    client.fund_account(&user, &5_000_000);
    client.authorize_service(&user, &service);

    // Set rate limit to 2 per minute
    client.set_rate_limit(&user, &service, &2);

    assert!(client.debit(&user, &service, &100_000));
    assert!(client.debit(&user, &service, &100_000));
    // Third call within same timestamp should fail due to rate limit
    client.debit(&user, &service, &100_000);
}
