/**
 * @author       Digitsensitive <digit.sensitivee@gmail.com>
 * @copyright    2017 - 2019 Digitsensitive
 * @description  Neuroevolution
 * @license      Digitsensitive
 */

import Generations from './generations';
import Generation from './generation';
import Genome from './network/genome';
import Network from './network/network';
// prettier-ignore
import {
    INeuroevolutionConfigRequired, 
    INeuroevolutionConfig,
    IExportData
} from './types/neuroevolution-config';
import { INetworkData } from './types/network-data';
import cloneDeep from 'lodash/cloneDeep.js';

class Neuroevolution {
    private configuration: INeuroevolutionConfigRequired;
    private generations: Generations;

    /**
     * To achieve exporting.
     * We need to rely on last generation.
     * Since, we can't touch the Network because of
     * During runtime it cannot fulfill the requirements
     * for exporting like the score of the best Network
     * And that is the reason why early release we are getting
     * data lessthan than population we had which is we are
     * expecting to get data with exact population count
     * */
    private exportableGenerations: Generation[];

    /**
     * Get all best genomes in all generation
     * */
    private bestGenomes: Genome[];

    constructor(config?: INeuroevolutionConfig) {
        this.configuration = Object.assign(
            {
                network: [1, [2], 1], // Perceptron network structure (1 hidden // layer).
                population: 50, // Population by generation.
                elitism: 0.2, // Best networks kepts unchanged for the next generation (rate).
                randomBehaviour: 0.2, // New random networks for the next generation (rate).
                mutationRate: 0.1, // Mutation rate on the weights of synapses.
                mutationRange: 0.5, // Interval of the mutation changes on the synapse weight
                historic: 0, // Latest generations saved.
                lowHistoric: false, // Only save score (not the network).
                scoreSort: -1, // Sort order (-1 = desc, 1 = asc).
                nbChild: 1, // Number of children by breeding. number
                crossoverFactor: 0.5 // Make an absolute copy of weight during breed 0 - 1
            },
            config
        );

        this.generations = new Generations(this);
        this.exportableGenerations = [];
        this.bestGenomes = [];
    }

    get options(): INeuroevolutionConfigRequired {
        return this.configuration;
    }

    /**
     * Get the configuration of this class
     */
    public getConfiguration(): INeuroevolutionConfigRequired {
        return this.configuration;
    }

    /**
     * Override the default configuration of this class
     */
    public setConfiguration(config: INeuroevolutionConfig): void {
        this.configuration = Object.assign(this.configuration, config);
    }

    /**
     * Reset and create a new generations object
     */
    public resetGeneration(): void {
        this.generations = new Generations(this);
    }

    /**
     * Create the next generation
     */
    public nextGeneration() {
        let networks: INetworkData[] = [];
        const currentGeneration = this.generations.getGenerations();

        this.exportableGenerations = cloneDeep(currentGeneration);

        if (currentGeneration.length === 0) {
            /* if no Generations, create first */
            // prettier-ignore
            networks = this.generations.firstGeneration(
                this.options.network[0] as number,
                this.options.network[1] as number[],
                this.options.network[2] as number
            );
        } else {
            /* otherwise, create next one */
            networks = this.generations.nextGeneration();
        }

        /* create Networks from the current Generation */
        const nns: Network[] = [];

        for (const network of networks) {
            const newNetwork: Network = new Network();
            newNetwork.loadNetworkWithData(network);
            nns.push(newNetwork);
        }

        if (this.options.lowHistoric) {
            /* remove old Networks */
            if (currentGeneration.length > 1) {
                const genomes = currentGeneration[currentGeneration.length - 2].getGenomes();

                genomes.splice(0, genomes.length - 1);
            }
        }

        if (this.options.historic !== -1) {
            /* Remove older generations */
            if (currentGeneration.length > this.options.historic + 1) {
                currentGeneration.splice(0, currentGeneration.length - (this.options.historic + 1));
            }
        }

        return nns;
    }

    /**
     * Export Trained Data
     * */
    exportData(): IExportData {
        const toExport: IExportData = {
            config: this.options,
            data: []
        };

        if (this.exportableGenerations.length < 1) {
            return toExport;
        }

        toExport.data = this.exportableGenerations.map((gen) => {
            return gen.getGenomes().map((genome) => {
                return {
                    network: genome.network,
                    score: genome.score
                };
            });
        });

        return toExport;
    }

    /**
     * Import Pretrained Data
     * */
    importData(data: IExportData): void {
        /* eslint-disable @typescript-eslint/no-unnecessary-condition */
        if (data.config) {
            this.setConfiguration(data.config);
        }

        data.data.forEach((generation) => {
            const gen = new Generation(this);

            generation.forEach(({ score, network }) => {
                gen.addGenome(new Genome(score, network));
            });

            console.log(gen);

            this.generations.getGenerations().push(gen);
        });
    }

    public exportBestGenomes(): IExportData {
        const toExport: IExportData = {
            config: this.options,
            data: []
        };

        if (this.exportableGenerations.length < 1) {
            return toExport;
        }

        toExport.data[0] = this.bestGenomes.map((genome) => {
            return {
                network: genome.network,
                score: genome.score
            };
        });

        return toExport;
    }

    private insertBestGenome(genome: Genome): void {
        const len = this.bestGenomes.length;
        if (len < 1) {
            this.bestGenomes.push(genome);
            return;
        }

        const { population, scoreSort } = this.options;

        /* locate position to insert Genome into, the gnomes should remain sorted */
        for (let i = 0; i < len; i++) {
            if (scoreSort < 0) {
                /* sort in descending order */
                if (genome.score > this.bestGenomes[i].score) {
                    this.bestGenomes.splice(i, 0, genome);
                    break;
                }
            } else {
                /* sort in ascending order */
                if (genome.score < this.bestGenomes[i].score) {
                    this.bestGenomes.splice(i, 0, genome);
                    break;
                }
            }
        }

        // Trim
        this.bestGenomes = this.bestGenomes.slice(0, population);
    }

    /**
     * Adds a new Genome with specified Neural Network and score.
     * @param {[type]} network [Neural Network]
     * @param {[type]} score   [Score value]
     */
    public networkScore(network: Network, score: number): boolean {
        /**
         * This new genome will improve the next generation
         * but it depends of its score.
         * */
        const genome = new Genome(score, network.getCopyOfTheNetwork());

        if (this.bestGenomes.length >= this.options.population) {
            if (this.bestGenomes[this.bestGenomes.length - 1].score < score) {
                this.insertBestGenome(cloneDeep(genome));
            }
        } else {
            this.insertBestGenome(cloneDeep(genome));
        }

        return this.generations.addGenome(genome);
    }
}

export default Neuroevolution;
