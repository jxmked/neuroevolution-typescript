import Genome from './network/genome';
import Neuroevolution from './neuroevolution';
import { INetworkData } from './types/network-data';

/**
 * Any other way to import lodash functions?
 * It is still include entire lodash into production build
 * */
import cloneDeep from 'lodash/cloneDeep.js';
import flatten from 'lodash/flatten.js';

/* Generation class, composed of a set of Genomes */
export default class Generation {
  public genomes: Genome[];
  private ne: Neuroevolution;

  constructor(ne: Neuroevolution) {
    this.genomes = [];
    this.ne = ne;
  }

  /**
   * Add a genome to the generation.
   * @param {[type]} _genome [Genome to add]
   */
  public addGenome(genome: Genome): number {
    /**
     * Locate position to insert new Genome into genome array
     * The genomes should remain sorted by score to
     * easily get the genomes with highest score
     * */
    for (let i = 0; i < this.genomes.length; i++) {
      if (this.ne.options.scoreSort < 0) {
        /* sort in descending order */
        if (genome.score > this.genomes[i].score) {
          this.genomes.splice(i, 0, genome);
          return i;
        }
      } else {
        /* sort in ascending order */
        if (genome.score < this.genomes[i].score) {
          this.genomes.splice(i, 0, genome);
          return i;
        }
      }
    }

    // Insert the first genomes
    this.genomes.push(genome);
    return 0;
  }

  /**
   * Generate the next generation
   */
  public generateNextGeneration(): INetworkData[] {
    // Check if we have a genome to start with
    if (this.genomes.length === 0) {
      throw new Error('No genome to start with');
    }

    const returnData: INetworkData[] = [];
    const { elitism, population, randomBehaviour } = this.ne.options;
    const populationEvolutionary: number = Math.round(elitism * population);
    const noiseLevel: number = Math.round(randomBehaviour * population);

    /**
     * Populate the next generation array with genomes network from
     * previous generation by a percentage of Neuroevolution.options.population
     * */
    for (let i = 0; i < populationEvolutionary; i++) {
      if (returnData.length < population) {
        returnData.push(cloneDeep(this.genomes[i].network));
      }
    }

    /**
     * Inserting randomized weights with petrained datas
     *
     * {Neuroevolution.options.randomBehaviour}
     * */
    if (noiseLevel > 0 && returnData.length < population) {
      for (let i = 0; i < noiseLevel; i++) {
        const weightLen: number = this.genomes[0].network.weights.length;
        const network: INetworkData = {
          neurons: flatten(this.ne.options.network),
          weights: []
        };

        for (let i = 0; i < weightLen; i++) {
          network.weights[i] = this.randomClamped();
        }

        returnData.push(network);
      }
    }

    let max = 1;

    /* eslint-disable no-constant-condition */
    /* eslint-disable @typescript-eslint/no-unnecessary-condition */
    while (true) {
      for (let i = 0; i < max; i++) {
        /**
         * Breed 2 genomes.
         * Starting from highest to lowest genomes
         * */
        const childs = this.breeder(this.genomes[i], this.genomes[max]);

        for (const child of childs) {
          returnData.push(child.network);

          if (returnData.length >= population) {
            /**
             * Return once number of children is equal to the
             * population by generation value
             * */
            return returnData;
          }
        }
      }

      max++;
      if (max >= this.genomes.length) {
        max = 0;
      }
    }
  }

  private breeder(firstGenome: Genome, secondGenome: Genome): Genome[] {
    let { nbChild } = this.ne.options;
    nbChild = nbChild > 0 ? nbChild : 1;

    /**
     * Randomly select breeding technique
     *
     * May improve mixing weights.
     *
     * TODO: Add more breeding techniques
     * */
    if (this.randomClamped() < 0) {
      return this.breeder_1(firstGenome, secondGenome, nbChild);
    }

    return this.breeder_2(firstGenome, secondGenome, nbChild);
  }

  /**
   * Breed 2 Genomes: Uniform Crossover Technique
   * */
  private breeder_1(g1: Genome, g2: Genome, nbChild: number): Genome[] {
    const childs: Genome[] = [];
    const { mutationRate, crossoverFactor } = this.ne.options;

    for (let nb = 0; nb < nbChild; nb++) {
      const childGenome: Genome = new Genome(g1.score, g1.network);

      // Uniform crossover
      for (let i = 0; i < g2.network.weights.length; i++) {
        if (Math.random() <= crossoverFactor) {
          childGenome.network.weights[i] = g2.network.weights[i];
        }
      }

      /**
       * Perform mutation on some weight
       * Resulting some weight gets larger than we expect
       * */
      for (let i = 0; i < childGenome.network.weights.length; i++) {
        if (Math.random() <= mutationRate) {
          childGenome.network.weights[i] += Math.random() * mutationRate * 2 - mutationRate;
        }
      }

      childs.push(childGenome);
    }

    return childs;
  }

  /**
   * Breed 2 genomes: Crossover between two points Technique
   * */
  private breeder_2(g1: Genome, g2: Genome, nbChild: number): Genome[] {
    const childs: Genome[] = [];
    const { mutationRate } = this.ne.options;
    const weightsLength = g2.network.weights.length;

    for (let nb = 0; nb < nbChild; nb++) {
      /**
       * Create the child based on first genome
       * */
      const childGenome: Genome = new Genome(g1.score, g1.network);

      /**
       * Select two random points of crossover
       *
       * We will specify the range of cross over
       * in between weight length
       * */
      let point1: number = Math.floor(Math.random() * weightsLength);
      let point2: number = Math.floor(Math.random() * weightsLength);

      if (point1 > point2) {
        [point1, point2] = [point2, point1];
      }

      /**
       * Crossover between the two points
       * */
      for (let i = point1; i < point2; i++) {
        childGenome.network.weights[i] = g2.network.weights[i];
      }

      /**
       * Perform mutation on some weight
       * Resulting some weight gets larger than we expect
       * */
      for (let i = 0; i < childGenome.network.weights.length; i++) {
        if (Math.random() <= mutationRate) {
          childGenome.network.weights[i] += Math.random() * mutationRate * 2 - mutationRate;
        }
      }

      childs.push(childGenome);
    }
    return childs;
  }

  /**
   * Returns a random value between -1 and 1
   * @return {number} [Random Value]
   */
  private randomClamped(): number {
    return Math.random() * 2 - 1;
  }
}
