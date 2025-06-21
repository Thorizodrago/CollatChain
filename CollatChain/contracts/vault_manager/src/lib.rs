// src/lib.rs
#![cfg_attr(not(test), no_std)]

use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, Map};

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct Vault {
    pub collateral: i128,
    pub debt: i128,
}

#[contract]
pub struct VaultManager;

#[contractimpl]
impl VaultManager {
    /// Initialize a vault for a new user
    pub fn init_vault(env: Env, user: Address) {
        user.require_auth();
        let mut vaults = Self::load_vaults(&env);
        if vaults.contains_key(user.clone()) {
            panic!("Vault already exists");
        }
        vaults.set(user.clone(), Vault { collateral: 0, debt: 0 });
        Self::save_vaults(&env, &vaults);
    }

    /// Deposit collateral into the user's vault (auto-init if none)
    pub fn deposit_collateral(env: Env, user: Address, amount: i128) {
        user.require_auth();
        let mut vaults = Self::load_vaults(&env);
        let mut vault = vaults.get(user.clone()).unwrap_or(Vault { collateral: 0, debt: 0 });
        vault.collateral = vault.collateral.checked_add(amount).unwrap();
        vaults.set(user.clone(), vault);
        Self::save_vaults(&env, &vaults);
    }

    /// Get the vault (collateral + debt) or None if not initialized
    pub fn get_vault(env: Env, user: Address) -> Option<Vault> {
        let vaults = Self::load_vaults(&env);
        vaults.get(user)
    }

        /// Attempt to borrow `amount` of loan token.
    /// Returns `true` on success, `false` if insufficient collateral.
    pub fn borrow(env: Env, user: Address, amount: i128) -> bool {
        user.require_auth();
        let mut vaults = Self::load_vaults(&env);
        let mut vault = vaults
            .get(user.clone())
            .unwrap_or(Vault { collateral: 0, debt: 0 });

        // 1) Fetch price of collateral in loan‐token units (stubbed here)
        let price = Self::get_price(&env);

        // 2) Compute collateral value and new debt
        let collateral_value = vault.collateral.checked_mul(price).unwrap();
        let new_debt = vault.debt.checked_add(amount).unwrap();

        // 3) Enforce: collateral_value * 100 >= new_debt * 150  (i.e. ≥150%)
        if collateral_value.checked_mul(100).unwrap()
            < new_debt.checked_mul(150).unwrap()
        {
            // insufficient collateral → signal failure
            return false;
        }

        // 4) All good → update debt and save
        vault.debt = new_debt;
        vaults.set(user.clone(), vault);
        Self::save_vaults(&env, &vaults);

        // (later: mint/transfer loan tokens to user)
        true
    }

	/// Repay up to `amount` of outstanding debt.
    /// Returns `true` if any debt was repaid, otherwise `false`.
    pub fn repay(env: Env, user: Address, amount: i128) -> bool {
        user.require_auth();

        // Load existing vault (uninitialized → debt = 0)
        let mut vaults = Self::load_vaults(&env);
        let mut vault = vaults
            .get(user.clone())
            .unwrap_or(Vault { collateral: 0, debt: 0 });

        // Nothing to repay?
        if vault.debt == 0 {
            return false;
        }

        // Compute how much we actually repay (clamp to vault.debt)
        let repay_amt = if amount > vault.debt {
            vault.debt
        } else {
            amount
        };

        // Update state
        vault.debt = vault.debt.checked_sub(repay_amt).unwrap();
        vaults.set(user.clone(), vault);
        Self::save_vaults(&env, &vaults);

        // (later: burn/accept loan tokens from user)
        true
    }

	/// Liquidate an under-collateralized vault.
    /// Caller (liquidator) must sign. Returns true if liquidation occurred.
    pub fn liquidate(env: Env, liquidator: Address, borrower: Address) -> bool {
        liquidator.require_auth();
        let mut vaults = Self::load_vaults(&env);

        let mut b_vault = vaults
            .get(borrower.clone())
            .unwrap_or(Vault { collateral: 0, debt: 0 });
        let mut l_vault = vaults
            .get(liquidator.clone())
            .unwrap_or(Vault { collateral: 0, debt: 0 });

        if b_vault.debt == 0 {
            return false;
        }

        let price = Self::get_price(&env);
        let coll_value = b_vault.collateral.checked_mul(price).unwrap();
        let debt = b_vault.debt;

        // Only liquidate if under-collateralized
        if coll_value.checked_mul(100).unwrap()
            >= debt.checked_mul(150).unwrap()
        {
            return false;
        }

        // Transfer all collateral to liquidator, zero out borrower
        l_vault.collateral = l_vault.collateral.checked_add(b_vault.collateral).unwrap();
        b_vault.collateral = 0;
        b_vault.debt = 0;

        vaults.set(liquidator.clone(), l_vault);
        vaults.set(borrower.clone(), b_vault);
        Self::save_vaults(&env, &vaults);

        true
    }
	/// (Test only) Override the price returned by get_price
	pub fn set_price(env: Env, price: i128) {
		// In a real system you'd restrict who can call this.
		env.storage()
			.instance()
			.set(&symbol_short!("price"), &price);
	}
	fn get_price(env: &Env) -> i128 {
		// If a test set a custom price, use it
		if let Some(p) = env.storage().instance().get(&symbol_short!("price")) {
			return p;
		}
		// Otherwise default to 1
		1
	}

	/// Withdraw up to `amount` of collateral from user's vault.
    /// Returns `true` on success, `false` if insufficient collateral.
    pub fn withdraw_collateral(env: Env, user: Address, amount: i128) -> bool {
        user.require_auth();

        // Load vault (nonexistent → collateral=0, debt=0)
        let mut vaults = Self::load_vaults(&env);
        let mut vault = vaults
            .get(user.clone())
            .unwrap_or(Vault { collateral: 0, debt: 0 });

        // Can't withdraw more than available collateral
        if amount > vault.collateral {
            return false;
        }

        // Reduce collateral
        vault.collateral = vault.collateral.checked_sub(amount).unwrap();
        vaults.set(user.clone(), vault);
        Self::save_vaults(&env, &vaults);

        // (later: actually transfer XLM back to user)
        true
    }

}

impl VaultManager {
    /// Load the map of all vaults from storage
    fn load_vaults(env: &Env) -> Map<Address, Vault> {
        env.storage()
            .instance()
            .get(&symbol_short!("vaults"))
            .unwrap_or(Map::new(env))
    }

    /// Save the map of vaults back into storage
    fn save_vaults(env: &Env, vaults: &Map<Address, Vault>) {
        env.storage()
            .instance()
            .set(&symbol_short!("vaults"), vaults);
    }
/*
    /// Placeholder price function: assume 1 XLM = 1 loan‐token unit
    fn get_price(_env: &Env) -> i128 {
        // TODO: replace with real oracle integration
        1
    }
		*/
}
	

#[cfg(test)]
mod test;