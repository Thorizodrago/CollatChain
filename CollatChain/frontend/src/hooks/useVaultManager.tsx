import { RPC_URL } from "../config";
import { useMemo } from "react";
import * as Client from "../../packages/vault_manager/dist/index";
import { getPublicKey, signTransaction } from "@/stellar-wallets-kit";

export const useVaultManager = () => {
	const vaultManager = useMemo(
		() =>
			new Client.Client({
				...Client.networks.testnet,
				rpcUrl: RPC_URL,
			}),
		[]
	);

	vaultManager.options.signTransaction = signTransaction;

	return vaultManager;
};
