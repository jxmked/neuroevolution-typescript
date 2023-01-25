import { INetworkData } from '../types/network-data';

export default class Genome {
  public score: number;
  public network: INetworkData;

  constructor(score: number, network: INetworkData) {
    this.score = score;

    // prettier-ignore
    this.network = Object.assign({
        neurons: [],
        weights: []
      }, network);
  }
}
