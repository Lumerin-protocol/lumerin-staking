import { useQuery } from "@tanstack/react-query";
import { arbitrum, mainnet } from "wagmi/chains";

const chainIdGeckoTerminalNetworkMap: Record<number, string | undefined> = {
  [mainnet.id]: "ethereum",
  [arbitrum.id]: "arbitrum",
};

export function useRates() {
  return useQuery({
    queryKey: ["rates"],
    queryFn: async (context) => {
      const chainId = process.env.REACT_APP_CHAIN_ID;
      const network = chainIdGeckoTerminalNetworkMap[chainId];
      if (!network) {
        console.error(
          `Can't fetch token prices. Unsupported chain ID: ${chainId}. Using mock data`
        );
        return Promise.resolve({ mor: 16.08, lmr: 0.0176 });
      }
      const [morAddress, lmrAddress] = [
        process.env.REACT_APP_MOR_ADDR,
        process.env.REACT_APP_LMR_ADDR,
      ] as const;
      const addresses = [morAddress, lmrAddress];
      const path = `https://api.geckoterminal.com/api/v2/simple/networks/${network}/token_price/${addresses.join(
        ","
      )}`;
      const response = await fetch(path, { signal: context.signal });
      if (!response.ok) {
        throw new Error(`Failed to fetch token prices: ${response.statusText}`);
      }
      const body = await response.json();
      const priceMap = body.data.attributes.token_prices as Record<string, string>;
      return { mor: Number(priceMap[morAddress]), lmr: Number(priceMap[lmrAddress]) };
    },
    refetchInterval: 30 * 60 * 1000,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: 5,
    retryDelay: 5000,
  });
}
