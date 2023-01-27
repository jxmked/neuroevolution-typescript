import Generation from './generation';
import Genome from './network/genome';
import Network from './network/network';
import Neuroevolution from './neuroevolution';
import { INetworkData } from './types/network-data';

export default class Generations {
  public generations: Generation[];
  private ne: Neuroevolution;

  constructor(ne: Neuroevolution) {
    this.generations = [];
    this.ne = ne;
  }
  
  /**
   * Create the first network generation with populated
   * random values.
   */
  public firstGeneration(inputNet: number, hiddenLayers: number[], outputNet: number): INetworkData[] {
    const networkData: INetworkData[] = [];

    for (let i = 0; i < this.ne.options.population; i++) {
      const network: Network = new Network();

      network.generateNetworkLayers(inputNet, hiddenLayers, outputNet);

      networkData.push(network.getCopyOfTheNetwork());
    }

    this.generations.push(new Generation(this.ne));
    return networkData;
  }

  /**
   * Create the next generation
   */
  public nextGeneration(): INetworkData[] {
    if (this.generations.length === 0) {
      throw new TypeError('Must call method Generations.firstGeneration() first.');
    }

    const gen: INetworkData[] = this.generations[this.generations.length - 1].generateNextGeneration();
    this.generations.push(new Generation(this.ne));
    return gen;
  }

  /**
   * Insert new trained genome to use in next generation
   */
  public addGenome(genome: Genome): number {
    if (this.generations.length === 0) {
      throw new Error('Cannot insert genome. Generations.generations has no item');
    }

    const generation = this.generations[this.generations.length - 1];

    return generation.addGenome(genome);
  }
}
