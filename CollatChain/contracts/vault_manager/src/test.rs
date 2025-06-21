use soroban_sdk::{testutils::Address as _, Env, Address};

use crate::{VaultManager, VaultManagerClient};

#[test]
fn test_simple() {
    let env = Env::default();
    let user = Address::generate(&env);
    let contract_id = env.register_contract(None, VaultManager);
    let _client = VaultManagerClient::new(&env, &contract_id);
    // smoke test – should compile and deploy
    assert!(true);
}

#[test]
fn test_init_vault() {
    let env = Env::default();
    let user = Address::generate(&env);
    let cid = env.register_contract(None, VaultManager);
    let client = VaultManagerClient::new(&env, &cid);
    env.mock_all_auths();
    client.init_vault(&user);
    let v = client.get_vault(&user).unwrap();
    assert_eq!(v.collateral, 0);
    assert_eq!(v.debt, 0);
}


#[test]
fn test_deposit_collateral() {
    let env = Env::default();
    let user = Address::generate(&env);
    let cid = env.register_contract(None, VaultManager);
    let client = VaultManagerClient::new(&env, &cid);
    env.mock_all_auths();
    client.init_vault(&user);
    client.deposit_collateral(&user, &100);
    let v = client.get_vault(&user).unwrap();
    assert_eq!(v.collateral, 100);
    assert_eq!(v.debt, 0);
}

#[test]
fn test_borrow_success() {
    let env = Env::default();
    let user = Address::generate(&env);
    let cid = env.register_contract(None, VaultManager);
    let client = VaultManagerClient::new(&env, &cid);
    env.mock_all_auths();

    // deposit 200 collateral → borrow 100 OK (200 * 1 price = 200, 100*150/100 = 150)
    client.deposit_collateral(&user, &200);
    client.borrow(&user, &100);

    let v = client.get_vault(&user).unwrap();
    assert_eq!(v.collateral, 200);
    assert_eq!(v.debt, 100);
}

#[test]
fn test_borrow_insufficient_collateral() {
    let env = Env::default();
    let user = Address::generate(&env);
    let cid = env.register_contract(None, VaultManager);
    let client = VaultManagerClient::new(&env, &cid);
    env.mock_all_auths();

    // deposit 100 collateral → borrowing 100 fails (100*1 = 100 < 100*150/100 = 150)
    client.deposit_collateral(&user, &100);
    client.borrow(&user, &100);
}

#[test]
fn test_repay_success() {
    let env = Env::default();
    let user = Address::generate(&env);
    let cid = env.register_contract(None, VaultManager);
    let client = VaultManagerClient::new(&env, &cid);
    env.mock_all_auths();

    // Set up: deposit then borrow
    client.deposit_collateral(&user, &200);
    assert!(client.borrow(&user, &100), "Borrow should succeed");
    // Now repay part of it
    let ok = client.repay(&user, &60);
    assert!(ok, "Repay should succeed");
    let v = client.get_vault(&user).unwrap();
    assert_eq!(v.debt, 40);
}

#[test]
fn test_repay_full_and_excess() {
    let env = Env::default();
    let user = Address::generate(&env);
    let cid = env.register_contract(None, VaultManager);
    let client = VaultManagerClient::new(&env, &cid);
    env.mock_all_auths();

    client.deposit_collateral(&user, &150);
    assert!(client.borrow(&user, &50), "Borrow should succeed");
    // Repay more than debt
    let ok = client.repay(&user, &100);
    assert!(ok, "Repay should succeed even if amount > debt");
    let v = client.get_vault(&user).unwrap();
    assert_eq!(v.debt, 0, "Debt should never go below zero");
}

#[test]
fn test_repay_without_debt() {
    let env = Env::default();
    let user = Address::generate(&env);
    let cid = env.register_contract(None, VaultManager);
    let client = VaultManagerClient::new(&env, &cid);
    env.mock_all_auths();

    // No borrow yet → repay should do nothing
    let ok = client.repay(&user, &10);
    assert!(!ok, "Repay on zero-debt vault should return false");
}

//------

#[test]
fn test_liquidate_no_debt() {
    let env = Env::default();
    let alice = Address::generate(&env);
    let bob   = Address::generate(&env);
    let cid   = env.register_contract(None, VaultManager);
    let client= VaultManagerClient::new(&env, &cid);
    env.mock_all_auths();

    // Bob has no debt → nothing to liquidate
    let ok = client.liquidate(&bob, &alice);
    assert!(!ok, "Cannot liquidate when borrower has no debt");
}

#[test]
fn test_liquidate_not_undercollateralized() {
    let env = Env::default();
    let alice = Address::generate(&env);
    let bob   = Address::generate(&env);
    let cid   = env.register_contract(None, VaultManager);
    let client= VaultManagerClient::new(&env, &cid);
    env.mock_all_auths();

    // Alice deposits 200, borrows 100 → ratio=200/100=2.0 ≥1.5 → no liquidation
    client.deposit_collateral(&alice, &200);
    assert!(client.borrow(&alice, &100));
    let ok = client.liquidate(&bob, &alice);
    assert!(!ok, "Should not liquidate a healthy vault");
}
#[test]
fn test_liquidate_success() {
    let env = Env::default();
    let alice = Address::generate(&env);
    let bob   = Address::generate(&env);
    let cid   = env.register_contract(None, VaultManager);
    let client= VaultManagerClient::new(&env, &cid);
    env.mock_all_auths();

    // 1) Alice deposits and borrows under healthy conditions
    client.deposit_collateral(&alice, &100);
    assert!(client.borrow(&alice, &50));
    
    // 2) Now simulate a price crash to 0 (so 100*0 < 50*150)
    client.set_price(&0);

    // 3) Liquidation should now succeed
    let ok = client.liquidate(&bob, &alice);
    assert!(ok);

    // Alice’s vault is reset
    let v_alice = client.get_vault(&alice).unwrap();
    assert_eq!(v_alice.collateral, 0);
    assert_eq!(v_alice.debt, 0);

    // Bob receives all collateral
    let v_bob = client.get_vault(&bob).unwrap();
    assert_eq!(v_bob.collateral, 100);
}

#[test]
fn test_withdraw_success() {
    let env = Env::default();
    let user = Address::generate(&env);
    let cid = env.register_contract(None, VaultManager);
    let client = VaultManagerClient::new(&env, &cid);
    env.mock_all_auths();

    client.deposit_collateral(&user, &100);
    let ok = client.withdraw_collateral(&user, &60);
    assert!(ok, "Withdraw should succeed when sufficient collateral");
    let v = client.get_vault(&user).unwrap();
    assert_eq!(v.collateral, 40);
    assert_eq!(v.debt, 0);
}

#[test]
fn test_withdraw_too_much() {
    let env = Env::default();
    let user = Address::generate(&env);
    let cid = env.register_contract(None, VaultManager);
    let client = VaultManagerClient::new(&env, &cid);
    env.mock_all_auths();

    client.deposit_collateral(&user, &50);
    let ok = client.withdraw_collateral(&user, &60);
    assert!(!ok, "Withdraw should fail when amount > collateral");
    let v = client.get_vault(&user).unwrap();
    assert_eq!(v.collateral, 50, "Collateral remains unchanged");
}

#[test]
fn test_withdraw_full() {
    let env = Env::default();
    let user = Address::generate(&env);
    let cid = env.register_contract(None, VaultManager);
    let client = VaultManagerClient::new(&env, &cid);
    env.mock_all_auths();

    client.deposit_collateral(&user, &30);
    let ok = client.withdraw_collateral(&user, &30);
    assert!(ok, "Withdraw full collateral should succeed");
    let v = client.get_vault(&user).unwrap();
    assert_eq!(v.collateral, 0);
    assert_eq!(v.debt, 0);
}
