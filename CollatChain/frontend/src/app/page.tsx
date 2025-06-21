'use client'
import React, { useState, useEffect } from 'react';
import { Wallet, Lock, Shield, TrendingUp, ArrowRight, DollarSign, RefreshCw, Link } from 'lucide-react';
import { isConnected, isAllowed, requestAccess, getAddress, getNetwork } from "@stellar/freighter-api";
import { Horizon } from '@stellar/stellar-sdk';
interface WalletData {
  address: string;
  network: string;
  balance: number;
}
const stellarSdkServer = new Horizon.Server("https://horizon-testnet.stellar.org");
export default function CollatChainApp() {
  // State'ler
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [stakeAmount, setStakeAmount] = useState<string>('');
  const [estimatedStablecoin, setEstimatedStablecoin] = useState<number>(0);
  const [xlmPrice, setXlmPrice] = useState<number>(0);
  const [priceLoading, setPriceLoading] = useState<boolean>(true);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Binance API'den XLM fiyatını çek (Public API - Key gerektirmez)
  const fetchXlmPrice = async () => {
    try {
      setPriceLoading(true);
      setPriceError(null);

      const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=XLMUSDT', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      const price = parseFloat(data.price);

      if (isNaN(price)) {
        throw new Error('Invalid price data received');
      }

      setXlmPrice(price);
      setLastUpdated(new Date().toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }));
      setPriceLoading(false);

    } catch (err) {
      console.error('XLM price fetch error:', err);
      setPriceError('Live price unavailable');
      setXlmPrice(0.12); // Fallback değer
      setLastUpdated('Using fallback price');
      setPriceLoading(false);
    }
  };

  // Fiyat ve hesaplamaları güncelle
  useEffect(() => {
    fetchXlmPrice();

    // Her 30 saniyede bir fiyatı güncelle (daha sık güncellenme)
    const interval = setInterval(fetchXlmPrice, 30 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Tahmini stablecoin miktarını hesapla
  useEffect(() => {
    if (stakeAmount && !isNaN(parseFloat(stakeAmount)) && parseFloat(stakeAmount) > 0) {
      const xlmValue = parseFloat(stakeAmount) * xlmPrice;
      setEstimatedStablecoin(xlmValue * 0.75); // %75 collateral oranı (daha konservatif)
    } else {
      setEstimatedStablecoin(0);
    }
  }, [stakeAmount, xlmPrice]);

  // Freighter Wallet bağlantısı
  const handleConnectWallet = async () => {
    setIsLoading(true);
    try {
      // Freighter yüklü mü kontrol et
      const { isConnected: freighterConnected } = await isConnected();
      if (!freighterConnected) {
        throw new Error("Freighter wallet not detected. Please install Freighter extension.");
      }

      // Freighter izin verdi mi kontrol et
      const { isAllowed: freighterAllowed } = await isAllowed();
      if (!freighterAllowed) {
        const accessRes = await requestAccess();
        if (accessRes.error) {
          throw new Error(accessRes.error);
        }
      }

      // Cüzdan adresi ve ağ bilgilerini al
      const addressRes = await getAddress();
      const networkRes = await getNetwork();

      if (!addressRes?.address || !networkRes?.network) {
        throw new Error("Cannot get wallet information from Freighter");
      }

      console.log("Freighter connected:", addressRes.address, networkRes.network);

      // Cüzdan bilgilerini state'e kaydet
      setWalletData({
        address: addressRes.address,
        network: networkRes.network,
        balance: parseFloat((await stellarSdkServer.accounts().accountId(addressRes.address).call()).balances[0].balance)
      });

    } catch (err) {
      console.error('Freighter connection error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown connection error';
      alert(`Wallet connection failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Stake işlemi (simüle edilmiş)
  const handleStake = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (!walletData || parseFloat(stakeAmount) > walletData.balance) {
      alert('Insufficient XLM balance');
      return;
    }

    setIsLoading(true);
    try {
      // Simüle edilmiş stake işlemi
      await new Promise(resolve => setTimeout(resolve, 2500));

      alert(`Successfully staked ${stakeAmount} XLM!\nYou will receive ${estimatedStablecoin.toFixed(2)} USDC in your wallet.`);
      setStakeAmount('');

      // Bakiyeyi güncelle (demo için)
      setWalletData(prev => prev ? {
        ...prev,
        balance: prev.balance - parseFloat(stakeAmount)
      } : null);

    } catch (err) {
      console.error('Staking error:', err);
      alert('Staking operation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Adres kısaltma
  const formatAddress = (address: string): string => {
    return address.length > 10
      ? `${address.slice(0, 8)}...${address.slice(-6)}`
      : address;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Gelişmiş Arkaplan Efektleri */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Diagonal gradient lines */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
          <div className="absolute top-20 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>
          <div className="absolute top-40 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent"></div>
          <div className="absolute bottom-40 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
          <div className="absolute bottom-20 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>
        </div>

        {/* Blurred circles */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl"></div>

        {/* Chain pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-8 h-8">
            <Link className="w-full h-full text-white rotate-45" />
          </div>
          <div className="absolute bottom-10 left-10 w-6 h-6">
            <Link className="w-full h-full text-white -rotate-12" />
          </div>
          <div className="absolute top-1/2 left-20 w-4 h-4">
            <Link className="w-full h-full text-white rotate-90" />
          </div>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-5xl">
        {/* Başlık */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <Link className="w-10 h-10 text-purple-400 mr-3" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              CollatChain
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-4">
            Decentralized XLM Collateral Platform
          </p>
          <p className="text-gray-400 max-w-xl mx-auto">
            Lock your XLM as collateral and instantly receive stablecoins without selling your assets
          </p>
        </div>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* XLM Fiyat Kartı */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-purple-500/30 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center mb-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  <p className="text-gray-300 text-sm font-medium">XLM/USDT</p>
                </div>
                {priceLoading ? (
                  <div className="animate-pulse h-8 w-28 bg-gray-700/50 rounded-lg"></div>
                ) : (
                  <p className="text-3xl font-bold text-white mb-1">
                    ${xlmPrice.toFixed(4)}
                  </p>
                )}
                {priceError ? (
                  <p className="text-yellow-400 text-xs">{priceError}</p>
                ) : (
                  <p className="text-gray-400 text-xs">
                    Updated: {lastUpdated}
                  </p>
                )}
              </div>
              <button
                onClick={fetchXlmPrice}
                disabled={priceLoading}
                className="p-3 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 disabled:opacity-50 transition-all duration-200 border border-purple-500/30"
              >
                <RefreshCw className={`w-5 h-5 text-purple-300 ${priceLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Collateral Ratio Kartı */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-blue-500/30 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm font-medium mb-2">Loan-to-Value</p>
                <p className="text-3xl font-bold text-white mb-1">75%</p>
                <p className="text-gray-400 text-xs">Safe collateral ratio</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-600/20 border border-blue-500/30">
                <Shield className="w-6 h-6 text-blue-300" />
              </div>
            </div>
          </div>

          {/* Total Locked Kartı */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-indigo-500/30 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm font-medium mb-2">Total Value Locked</p>
                <p className="text-3xl font-bold text-white mb-1">$2.1M</p>
                <p className="text-gray-400 text-xs">4.2M XLM locked</p>
              </div>
              <div className="p-3 rounded-xl bg-indigo-600/20 border border-indigo-500/30">
                <Lock className="w-6 h-6 text-indigo-300" />
              </div>
            </div>
          </div>
        </div>

        {/* Ana Kart */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
          {!walletData ? (
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center border border-purple-500/30">
                <Wallet className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Connect Wallet</h2>
              <p className="text-gray-300 mb-8 max-w-md mx-auto">
                Connect your Stellar wallet to start using CollatChain's collateral services
              </p>
              <button
                onClick={handleConnectWallet}
                disabled={isLoading}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Connecting...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Wallet className="w-5 h-5 mr-2" />
                    Connect Stellar Wallet
                  </div>
                )}
              </button>
            </div>
          ) : (
            <div>
              {/* Cüzdan Bilgileri */}
              <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-2xl p-6 mb-8 border border-purple-500/20">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="mb-4 sm:mb-0">
                    <div className="flex items-center mb-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                      <p className="text-gray-300 text-sm font-medium">Wallet Connected</p>
                    </div>
                    <p className="text-white font-mono text-lg mb-1">{formatAddress(walletData.address)}</p>
                    <p className="text-purple-300 text-sm">
                      {walletData.network}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-300 text-sm font-medium mb-1">Available Balance</p>
                    <p className="text-white font-bold text-2xl">
                      {walletData.balance.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-gray-400 text-sm">XLM</p>
                  </div>
                </div>
              </div>

              {/* Stake Formu */}
              <div className="space-y-8">
                <div>
                  <label className="block text-white font-semibold mb-3 text-lg">
                    XLM Amount to Collateralize
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-white/5 border border-white/20 rounded-2xl px-6 py-4 text-white text-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    />
                    <button
                      onClick={() => setStakeAmount(walletData.balance.toString())}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 hover:text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
                    >
                      MAX
                    </button>
                  </div>
                </div>

                {/* Hesaplama Gösterimi */}
                {stakeAmount && parseFloat(stakeAmount) > 0 && (
                  <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-2xl p-6 border border-green-500/20">
                    <h3 className="text-white font-semibold mb-4 text-lg">Loan Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Collateral Value:</span>
                        <span className="text-white font-semibold">
                          ${(parseFloat(stakeAmount) * xlmPrice).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Loan-to-Value (75%):</span>
                        <span className="text-white font-semibold">
                          ${estimatedStablecoin.toFixed(2)}
                        </span>
                      </div>
                      <div className="border-t border-white/20 pt-3 mt-4">
                        <div className="flex items-center justify-between">
                          <span className="text-white font-bold text-lg">You Receive:</span>
                          <span className="text-green-400 font-bold text-2xl">
                            {estimatedStablecoin.toFixed(2)} USDC
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Stake Butonu */}
                <button
                  onClick={handleStake}
                  disabled={isLoading || !stakeAmount || parseFloat(stakeAmount) <= 0}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:opacity-50 text-white font-bold py-5 px-6 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg text-lg"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      Processing Transaction...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <DollarSign className="w-6 h-6 mr-2" />
                      Collateralize XLM & Receive USDC
                      <ArrowRight className="w-6 h-6 ml-2" />
                    </div>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bilgi Bölümü */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center mr-4">
                <TrendingUp className="w-5 h-5 text-purple-300" />
              </div>
              <h3 className="text-2xl font-bold text-white">How It Works</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4">1</span>
                <div>
                  <p className="text-white font-medium">Lock XLM Collateral</p>
                  <p className="text-gray-400 text-sm">Deposit your XLM into our secure smart contract</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4">2</span>
                <div>
                  <p className="text-white font-medium">Receive USDC Instantly</p>
                  <p className="text-gray-400 text-sm">Get up to 75% of your collateral value in USDC</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4">3</span>
                <div>
                  <p className="text-white font-medium">Repay & Reclaim</p>
                  <p className="text-gray-400 text-sm">Return USDC plus interest to unlock your XLM</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 rounded-xl bg-green-600/20 flex items-center justify-center mr-4">
                <Shield className="w-5 h-5 text-green-300" />
              </div>
              <h3 className="text-2xl font-bold text-white">Security Features</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-start">
                <Shield className="w-5 h-5 text-green-400 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium">Stellar Network Security</p>
                  <p className="text-gray-400 text-sm">Built on the robust Stellar blockchain</p>
                </div>
              </div>
              <div className="flex items-start">
                <Shield className="w-5 h-5 text-blue-400 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium">Smart Contract Audited</p>
                  <p className="text-gray-400 text-sm">Thoroughly tested and verified contracts</p>
                </div>
              </div>
              <div className="flex items-start">
                <Shield className="w-5 h-5 text-purple-400 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium">Transparent Operations</p>
                  <p className="text-gray-400 text-sm">All transactions visible on-chain</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
