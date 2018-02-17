import { Aqueduct } from './generated/aqueduct';

export class TokenCache {
  private readonly networkTokenPairMap: Record<string, Promise<Aqueduct.Api.ITokenPair[]>> = {};
  private tokenSymbolMap: Record<string, Aqueduct.Api.IToken> | undefined;

  public async getTokenPair(baseSymbol: string, quoteSymbol: string, networkId: number) {
    const tokenPairs = await this.getSupportedTokenPairs(networkId);

    const tokenPair = tokenPairs.find(tp => tp.tokenA.symbol.toLowerCase() === baseSymbol.toLowerCase() && tp.tokenB.symbol.toLowerCase() === quoteSymbol.toLowerCase());
    if (!tokenPair) {
      throw new Error(`token pair not found or supported: ${baseSymbol}/${quoteSymbol}`);
    }

    return tokenPair;
  }

  public async getTokenBySymbol(symbol: string, networkId: number) {
    const map = await this.getTokenMap(networkId);

    const token = map[symbol];
    if (!token) {
      throw new Error(`token not found or supported: ${symbol}`);
    }

    return token;
  }

  private async getSupportedTokenPairs(networkId: number) {
    const tokenPairsPromise = this.networkTokenPairMap[networkId];
    if (tokenPairsPromise) {
      return await tokenPairsPromise;
    }

    this.networkTokenPairMap[networkId] = new Aqueduct.Api.TokenPairsService().get({ networkId });
    return await this.networkTokenPairMap[networkId];
  }

  private async getTokenMap(networkId: number) {
    if (this.tokenSymbolMap) { return this.tokenSymbolMap; }

    const tokenPairs = await this.getSupportedTokenPairs(networkId);

    const map: Record<string, Aqueduct.Api.IToken> = {};
    tokenPairs.forEach(tp => {
      map[tp.tokenA.symbol] = tp.tokenA;
      map[tp.tokenB.symbol] = tp.tokenB;
    });

    this.tokenSymbolMap = map;
    return map;
  }
}

export const tokenCache = new TokenCache();
