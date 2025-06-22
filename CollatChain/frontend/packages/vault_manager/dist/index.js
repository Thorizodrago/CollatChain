import { Buffer } from "buffer";
import { Client as ContractClient, Spec as ContractSpec, } from '@stellar/stellar-sdk/contract';
export * from '@stellar/stellar-sdk';
export * as contract from '@stellar/stellar-sdk/contract';
export * as rpc from '@stellar/stellar-sdk/rpc';
if (typeof window !== 'undefined') {
    //@ts-ignore Buffer exists
    window.Buffer = window.Buffer || Buffer;
}
export const networks = {
    testnet: {
        networkPassphrase: "Test SDF Network ; September 2015",
        contractId: "CDEAM6F7UOL6DK3PGGZI4HC4RODPY5ZGBXGSIM7XCEG6PW5BV5BFHL22",
    }
};
export const Errors = {};
export class Client extends ContractClient {
    options;
    static async deploy(
    /** Options for initalizing a Client as well as for calling a method, with extras specific to deploying. */
    options) {
        return ContractClient.deploy(null, options);
    }
    constructor(options) {
        super(new ContractSpec(["AAAAAQAAAAAAAAAAAAAABVZhdWx0AAAAAAAAAgAAAAAAAAAKY29sbGF0ZXJhbAAAAAAACwAAAAAAAAAEZGVidAAAAAs=",
            "AAAAAAAAACFJbml0aWFsaXplIGEgdmF1bHQgZm9yIGEgbmV3IHVzZXIAAAAAAAAKaW5pdF92YXVsdAAAAAAAAQAAAAAAAAAEdXNlcgAAABMAAAAA",
            "AAAAAAAAADxEZXBvc2l0IGNvbGxhdGVyYWwgaW50byB0aGUgdXNlcidzIHZhdWx0IChhdXRvLWluaXQgaWYgbm9uZSkAAAASZGVwb3NpdF9jb2xsYXRlcmFsAAAAAAACAAAAAAAAAAR1c2VyAAAAEwAAAAAAAAAGYW1vdW50AAAAAAALAAAAAA==",
            "AAAAAAAAADxHZXQgdGhlIHZhdWx0IChjb2xsYXRlcmFsICsgZGVidCkgb3IgTm9uZSBpZiBub3QgaW5pdGlhbGl6ZWQAAAAJZ2V0X3ZhdWx0AAAAAAAAAQAAAAAAAAAEdXNlcgAAABMAAAABAAAD6AAAB9AAAAAFVmF1bHQAAAA=",
            "AAAAAAAAAGhBdHRlbXB0IHRvIGJvcnJvdyBgYW1vdW50YCBvZiBsb2FuIHRva2VuLgpSZXR1cm5zIGB0cnVlYCBvbiBzdWNjZXNzLCBgZmFsc2VgIGlmIGluc3VmZmljaWVudCBjb2xsYXRlcmFsLgAAAAZib3Jyb3cAAAAAAAIAAAAAAAAABHVzZXIAAAATAAAAAAAAAAZhbW91bnQAAAAAAAsAAAABAAAAAQ==",
            "AAAAAAAAAGNSZXBheSB1cCB0byBgYW1vdW50YCBvZiBvdXRzdGFuZGluZyBkZWJ0LgpSZXR1cm5zIGB0cnVlYCBpZiBhbnkgZGVidCB3YXMgcmVwYWlkLCBvdGhlcndpc2UgYGZhbHNlYC4AAAAABXJlcGF5AAAAAAAAAgAAAAAAAAAEdXNlcgAAABMAAAAAAAAABmFtb3VudAAAAAAACwAAAAEAAAAB",
            "AAAAAAAAAG1MaXF1aWRhdGUgYW4gdW5kZXItY29sbGF0ZXJhbGl6ZWQgdmF1bHQuCkNhbGxlciAobGlxdWlkYXRvcikgbXVzdCBzaWduLiBSZXR1cm5zIHRydWUgaWYgbGlxdWlkYXRpb24gb2NjdXJyZWQuAAAAAAAACWxpcXVpZGF0ZQAAAAAAAAIAAAAAAAAACmxpcXVpZGF0b3IAAAAAABMAAAAAAAAACGJvcnJvd2VyAAAAEwAAAAEAAAAB",
            "AAAAAAAAADQoVGVzdCBvbmx5KSBPdmVycmlkZSB0aGUgcHJpY2UgcmV0dXJuZWQgYnkgZ2V0X3ByaWNlAAAACXNldF9wcmljZQAAAAAAAAEAAAAAAAAABXByaWNlAAAAAAAACwAAAAA=",
            "AAAAAAAAAHdXaXRoZHJhdyB1cCB0byBgYW1vdW50YCBvZiBjb2xsYXRlcmFsIGZyb20gdXNlcidzIHZhdWx0LgpSZXR1cm5zIGB0cnVlYCBvbiBzdWNjZXNzLCBgZmFsc2VgIGlmIGluc3VmZmljaWVudCBjb2xsYXRlcmFsLgAAAAATd2l0aGRyYXdfY29sbGF0ZXJhbAAAAAACAAAAAAAAAAR1c2VyAAAAEwAAAAAAAAAGYW1vdW50AAAAAAALAAAAAQAAAAE="]), options);
        this.options = options;
    }
    fromJSON = {
        init_vault: (this.txFromJSON),
        deposit_collateral: (this.txFromJSON),
        get_vault: (this.txFromJSON),
        borrow: (this.txFromJSON),
        repay: (this.txFromJSON),
        liquidate: (this.txFromJSON),
        set_price: (this.txFromJSON),
        withdraw_collateral: (this.txFromJSON)
    };
}
