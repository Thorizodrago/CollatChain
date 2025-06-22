'use client'
import {
	allowAllModules,
	FREIGHTER_ID,
	StellarWalletsKit,
	WalletNetwork,
} from "@creit.tech/stellar-wallets-kit";

const LOCAL_STORAGE_KEYS = {
	SELECTED_WALLET_ID: "selectedWalletId",
} as const;

function getSelectedWalletId() {
	if (typeof window === "undefined") return;
	return localStorage.getItem(LOCAL_STORAGE_KEYS.SELECTED_WALLET_ID);
}

export function setSelectedWalletId(walletId: string) {
	if (typeof window === "undefined") return;
	localStorage.setItem(LOCAL_STORAGE_KEYS.SELECTED_WALLET_ID, walletId);
	kit.setWallet(walletId);
}

const kit = new StellarWalletsKit({
	modules: allowAllModules(),
	network: WalletNetwork.TESTNET,
	// network: networks.testnet.networkPassphrase as WalletNetwork,
	// StellarWalletsKit forces you to specify a wallet, even if the user didn't
	// select one yet, so we default to Freighter.
	// We'll work around this later in `getPublicKey`.
	selectedWalletId: getSelectedWalletId() ?? FREIGHTER_ID,
});

export const signTransaction = kit.signTransaction.bind(kit);

export async function getPublicKey() {
	if (!getSelectedWalletId()) return null;
	const { address } = await kit.getAddress();
	return address;
}

export async function connect() {
	return new Promise(async (resolve, reject) => {
		await kit.openModal({
			onWalletSelected: async (option) => {
				setSelectedWalletId(option.id);
				resolve(option.id);
			},
		});
	});
}

export function disconnect() {
	localStorage.removeItem(LOCAL_STORAGE_KEYS.SELECTED_WALLET_ID);
	kit.disconnect();
}
