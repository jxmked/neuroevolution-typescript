/**
 * @author       Digitsensitive <digit.sensitivee@gmail.com>
 * @copyright    2017 - 2019 Digitsensitive
 * @description  Neuroevolution: Generation
 * @license      Digitsensitive
 */

import Genome from './network/genome';
import Neuroevolution from './neuroevolution';
import { INetworkData } from './types/network-data';

/**
 * Any other way to import lodash functions?
 * It is still include entire lodash into production build
 * */
import cloneDeep from 'lodash/cloneDeep.js';

/* Generation class, composed of a set of Genomes */
export default class Generation {
    private genomes: Genome[];
    private ne: Neuroevolution;

    constructor(ne: Neuroevolution) {
        /* init parameters */
        this.genomes = [];
        this.ne = ne;
    }

    public getGenomes(): Genome[] {
        return this.genomes;
    }

    /**
     * Add a genome to the generation.
     * @param {[type]} _genome [Genome to add]
     */
    public addGenome(genome: Genome): void {
        /* locate position to insert Genome into, the gnomes should remain sorted */
        for (let i = 0; i < this.genomes.length; i++) {
            if (this.ne.options.scoreSort < 0) {
                /* sort in descending order */
                if (genome.score > this.genomes[i].score) {
                    this.genomes.splice(i, 0, genome);
                    return;
                }
            } else {
                /* sort in ascending order */
                if (genome.score < this.genomes[i].score) {
                    this.genomes.splice(i, 0, genome);
                    return;
                }
            }
        }

        /* insert genome into correct position */
        this.genomes.push(genome);
    }

    /**
     * Generate the next generation
     */
    public generateNextGeneration(): INetworkData[] {
        // Check if we have a genome to start with
        if (this.genomes.length === 0) {
            throw new Error('No genome to start with');
        }

        const networkDatas: INetworkData[] = [];
        const { elitism, population, randomBehaviour } = this.ne.options;
        const populationEvolutionary: number = Math.round(elitism * population);
        const noiseLevel: number = Math.round(randomBehaviour * population);

        for (let i = 0; i < populationEvolutionary; i++) {
            if (networkDatas.length < population) {
                /* push a deep copy of ith Genome's Nethwork */
                networkDatas.push(cloneDeep(this.genomes[i].network));
            }
        }

        /**
         * This noise level loop will help AI to solve
         * problem based on genome with highest score
         * */
        for (let i = 0; i < noiseLevel; i++) {
            if (networkDatas.length > population) {
                break;
            }

            /**
             * Create new Generation based on genome with highest
             * score from last generation
             * */
            const network: INetworkData = cloneDeep(this.genomes[0].network);

            for (let weightIndex = 0; weightIndex < network.weights.length; weightIndex++) {
                network.weights[weightIndex] = this.randomClamped();
            }

            networkDatas.push(network);
        }

        let max = 1;

        /* eslint-disable no-constant-condition */
        /* eslint-disable @typescript-eslint/no-unnecessary-condition */
        while (true) {
            for (let i = 0; i < max; i++) {
                /**
                 * Breed 2 genomes
                 * */
                const childs = this.breeder(this.genomes[i], this.genomes[max]);

                for (const child of childs) {
                    networkDatas.push(child.network);

                    if (networkDatas.length >= population) {
                        /**
                         * Return once number of children is equal to the
                         * population by generation value
                         * */
                        return networkDatas;
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
         * May improve mixing weights
         * */
        if (this.randomClamped() < 0) {
            return this.breeder_1(firstGenome, secondGenome, nbChild);
        }

        return this.breeder_2(firstGenome, secondGenome, nbChild);
    }
    /**
     * Breed to genomes to produce offspring(s)
     * @param  {[type]} g1       [Genome 1]
     * @param  {[type]} g2       [Genome 2]
     * @param  {[type]} nbChilds [Number of offspring (children)]
     * @return {Object}          [Object]
     */
    private breeder_1(g1: Genome, g2: Genome, nbChild: number): Genome[] {
        const childs: Genome[] = [];
        const { mutationRate, crossoverFactor } = this.ne.options;

        for (let nb = 0; nb < nbChild; nb++) {
            /* Deep clone of genome 1 */
            const childGenome: Genome = new Genome(g1.score, g1.network);

            // Uniform crossover
            for (let i = 0; i < g2.network.weights.length; i++) {
                /* Genetic crossover
                 * FIXME Really should be a predefined constant */
                if (Math.random() <= crossoverFactor) {
                    childGenome.network.weights[i] = g2.network.weights[i];
                }
            }

            /* perform mutation on some weights */
            for (let i = 0; i < childGenome.network.weights.length; i++) {
                if (Math.random() <= mutationRate) {
                    childGenome.network.weights[i] += Math.random() * mutationRate * 2 - mutationRate;
                }
            }

            childs.push(childGenome);
        }

        return childs;
    }

    private breeder_2(g1: Genome, g2: Genome, nbChild: number): Genome[] {
        const childs: Genome[] = [];
        const { mutationRate } = this.ne.options;
        const weightsLength = g2.network.weights.length;

        for (let nb = 0; nb < nbChild; nb++) {
            /**
             * Crrate the child based on first genome
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
