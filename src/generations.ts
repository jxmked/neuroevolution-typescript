import Generation from './generation';
import Genome from './network/genome';
import Network from './network/network';
import Neuroevolution from './neuroevolution';
import { INetworkData } from './types/network-data';

export default class Generations {
  private generations: Generation[];
  private ne: Neuroevolution;

  constructor(ne: Neuroevolution) {
    this.generations = [];
    this.ne = ne;
  }

  public getGenerations(): Generation[] {
    return this.generations;
  }

  /**
   * Create the first network generation with populated
   * random values.
   */
  public firstGeneration(input: number, hiddens: number[], output: number): INetworkData[] {
    const networkData: INetworkData[] = [];

    for (let i = 0; i < this.ne.options.population; i++) {
      const network: Network = new Network();

      network.generateNetworkLayers(input, hiddens, output);

      networkData.push(network.getCopyOfTheNetwork());
    }

    this.generations.push(new Generation(this.ne));
    return networkData;
  }

  /**
   * Create the next
   */
  public nextGeneration(): INetworkData[] {
    if (this.generations.length === 0) {
      throw new TypeError('Must call method Generations.firstGeneration() first.');
    }

    const gen: INetworkData[] = this.generations[this.generations.length - 1].generateNextGeneration();
    this.generations.push(new Generation(this.ne));
    return gen;
  }

  public addGenome(genome: Genome): boolean {
    /* cant add to a Generation if there are no Generations */
    if (this.generations.length === 0) {
      throw new Error('Cannot insert genome. Generations.generations has no item');
    }

    const generation = this.generations[this.generations.length - 1];

    generation.addGenome(genome);

    return generation.genomes.length > 0;
  }
}
