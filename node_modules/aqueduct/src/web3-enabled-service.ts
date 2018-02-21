import { ZeroEx } from '0x.js/lib/src/0x';
import * as Web3 from 'web3';

export abstract class Web3EnabledService<T> {
  protected readonly web3: Web3;
  protected networkId: number;
  protected zeroEx: ZeroEx;

  constructor(nodeUrl: string) {
    this.web3 = new Web3(new Web3.providers.HttpProvider(nodeUrl));
   }

  public async execute() {
    try {
      this.networkId = await this.getNetworkId();
    } catch (err) {
      console.error('failed to get network ID...');
      throw err;
    }

    this.zeroEx = new ZeroEx(this.web3.currentProvider, {
      networkId: this.networkId
    });

    return await this.run();
  }

  protected abstract run(): Promise<T>;

  private getNetworkId() {
    return new Promise<number>((resolve, reject) => {
      this.web3.version.getNetwork((err, networkId) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(parseInt(networkId, 10));
      });
    });
  }
}
