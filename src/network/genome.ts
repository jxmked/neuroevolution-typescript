import { INetworkData } from '../types/network-data';

export default class Genome {
    private __score__: number;
    private __network__: INetworkData;

    constructor(score: number, network: INetworkData) {
        this.__score__ = score;

        this.__network__ = Object.assign(
            {
                neurons: [],
                weights: []
            },
            network
        );
    }

    get network(): INetworkData {
        return this.__network__;
    }

    get score(): number {
        return this.__score__;
    }
}
