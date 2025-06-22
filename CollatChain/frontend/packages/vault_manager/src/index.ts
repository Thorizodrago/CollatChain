import { Buffer } from "buffer";
import { Address } from '@stellar/stellar-sdk';
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from '@stellar/stellar-sdk/contract';
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Typepoint,
  Duration,
} from '@stellar/stellar-sdk/contract';
export * from '@stellar/stellar-sdk'
export * as contract from '@stellar/stellar-sdk/contract'
export * as rpc from '@stellar/stellar-sdk/rpc'

if (typeof window !== 'undefined') {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CDEAM6F7UOL6DK3PGGZI4HC4RODPY5ZGBXGSIM7XCEG6PW5BV5BFHL22",
  }
} as const


export interface Vault {
  collateral: i128;
  debt: i128;
}

export const Errors = {

}

export interface Client {
  /**
   * Construct and simulate a init_vault transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Initialize a vault for a new user
   */
  init_vault: ({user}: {user: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a deposit_collateral transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Deposit collateral into the user's vault (auto-init if none)
   */
  deposit_collateral: ({user, amount}: {user: string, amount: i128}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a get_vault transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get the vault (collateral + debt) or None if not initialized
   */
  get_vault: ({user}: {user: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Option<Vault>>>

  /**
   * Construct and simulate a borrow transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Attempt to borrow `amount` of loan token.
   * Returns `true` on success, `false` if insufficient collateral.
   */
  borrow: ({user, amount}: {user: string, amount: i128}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<boolean>>

  /**
   * Construct and simulate a repay transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Repay up to `amount` of outstanding debt.
   * Returns `true` if any debt was repaid, otherwise `false`.
   */
  repay: ({user, amount}: {user: string, amount: i128}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<boolean>>

  /**
   * Construct and simulate a liquidate transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Liquidate an under-collateralized vault.
   * Caller (liquidator) must sign. Returns true if liquidation occurred.
   */
  liquidate: ({liquidator, borrower}: {liquidator: string, borrower: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<boolean>>

  /**
   * Construct and simulate a set_price transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * (Test only) Override the price returned by get_price
   */
  set_price: ({price}: {price: i128}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a withdraw_collateral transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Withdraw up to `amount` of collateral from user's vault.
   * Returns `true` on success, `false` if insufficient collateral.
   */
  withdraw_collateral: ({user, amount}: {user: string, amount: i128}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<boolean>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initalizing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAQAAAAAAAAAAAAAABVZhdWx0AAAAAAAAAgAAAAAAAAAKY29sbGF0ZXJhbAAAAAAACwAAAAAAAAAEZGVidAAAAAs=",
        "AAAAAAAAACFJbml0aWFsaXplIGEgdmF1bHQgZm9yIGEgbmV3IHVzZXIAAAAAAAAKaW5pdF92YXVsdAAAAAAAAQAAAAAAAAAEdXNlcgAAABMAAAAA",
        "AAAAAAAAADxEZXBvc2l0IGNvbGxhdGVyYWwgaW50byB0aGUgdXNlcidzIHZhdWx0IChhdXRvLWluaXQgaWYgbm9uZSkAAAASZGVwb3NpdF9jb2xsYXRlcmFsAAAAAAACAAAAAAAAAAR1c2VyAAAAEwAAAAAAAAAGYW1vdW50AAAAAAALAAAAAA==",
        "AAAAAAAAADxHZXQgdGhlIHZhdWx0IChjb2xsYXRlcmFsICsgZGVidCkgb3IgTm9uZSBpZiBub3QgaW5pdGlhbGl6ZWQAAAAJZ2V0X3ZhdWx0AAAAAAAAAQAAAAAAAAAEdXNlcgAAABMAAAABAAAD6AAAB9AAAAAFVmF1bHQAAAA=",
        "AAAAAAAAAGhBdHRlbXB0IHRvIGJvcnJvdyBgYW1vdW50YCBvZiBsb2FuIHRva2VuLgpSZXR1cm5zIGB0cnVlYCBvbiBzdWNjZXNzLCBgZmFsc2VgIGlmIGluc3VmZmljaWVudCBjb2xsYXRlcmFsLgAAAAZib3Jyb3cAAAAAAAIAAAAAAAAABHVzZXIAAAATAAAAAAAAAAZhbW91bnQAAAAAAAsAAAABAAAAAQ==",
        "AAAAAAAAAGNSZXBheSB1cCB0byBgYW1vdW50YCBvZiBvdXRzdGFuZGluZyBkZWJ0LgpSZXR1cm5zIGB0cnVlYCBpZiBhbnkgZGVidCB3YXMgcmVwYWlkLCBvdGhlcndpc2UgYGZhbHNlYC4AAAAABXJlcGF5AAAAAAAAAgAAAAAAAAAEdXNlcgAAABMAAAAAAAAABmFtb3VudAAAAAAACwAAAAEAAAAB",
        "AAAAAAAAAG1MaXF1aWRhdGUgYW4gdW5kZXItY29sbGF0ZXJhbGl6ZWQgdmF1bHQuCkNhbGxlciAobGlxdWlkYXRvcikgbXVzdCBzaWduLiBSZXR1cm5zIHRydWUgaWYgbGlxdWlkYXRpb24gb2NjdXJyZWQuAAAAAAAACWxpcXVpZGF0ZQAAAAAAAAIAAAAAAAAACmxpcXVpZGF0b3IAAAAAABMAAAAAAAAACGJvcnJvd2VyAAAAEwAAAAEAAAAB",
        "AAAAAAAAADQoVGVzdCBvbmx5KSBPdmVycmlkZSB0aGUgcHJpY2UgcmV0dXJuZWQgYnkgZ2V0X3ByaWNlAAAACXNldF9wcmljZQAAAAAAAAEAAAAAAAAABXByaWNlAAAAAAAACwAAAAA=",
        "AAAAAAAAAHdXaXRoZHJhdyB1cCB0byBgYW1vdW50YCBvZiBjb2xsYXRlcmFsIGZyb20gdXNlcidzIHZhdWx0LgpSZXR1cm5zIGB0cnVlYCBvbiBzdWNjZXNzLCBgZmFsc2VgIGlmIGluc3VmZmljaWVudCBjb2xsYXRlcmFsLgAAAAATd2l0aGRyYXdfY29sbGF0ZXJhbAAAAAACAAAAAAAAAAR1c2VyAAAAEwAAAAAAAAAGYW1vdW50AAAAAAALAAAAAQAAAAE=" ]),
      options
    )
  }
  public readonly fromJSON = {
    init_vault: this.txFromJSON<null>,
        deposit_collateral: this.txFromJSON<null>,
        get_vault: this.txFromJSON<Option<Vault>>,
        borrow: this.txFromJSON<boolean>,
        repay: this.txFromJSON<boolean>,
        liquidate: this.txFromJSON<boolean>,
        set_price: this.txFromJSON<null>,
        withdraw_collateral: this.txFromJSON<boolean>
  }
}