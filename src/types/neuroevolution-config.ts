import { INetworkData } from './network-data';

export interface INeuroevolutionConfig {
  /**
   * Network structure
   *
   * @default - [1, [2], 1]
   * @var number[] - [input, hidden, output]
   */
  network?: (number | number[])[];

  /**
   * Population by generation
   *
   * @default - 50
   * @var number
   */
  population?: number;

  /**
   * Best network kepts unchange for next generation
   *
   * @default - 0.2
   * @var number - 0.0 - 1.0
   */
  elitism?: number;

  /**
   * Mix trained networks with randomized networks for next generation
   *
   * @default - 0.2
   * @var number - 0.0 - 1.0
   */
  randomBehaviour?: number;

  /**
   * Perform mutation on some genomes during breed
   *
   * @default - 0.1
   * @var number - 0.0 - 1.0
   */
  mutationRate?: number;

  /**
   * Number of generation to be saved.
   * Set to -1 to only keep the latest generation
   *
   * @default - 0
   * @var number - -1 - n
   */
  historic?: number; // Latest generations saved.

  /**
   * ...
   *
   * @default - false
   * @var boolean
   */
  lowHistoric?: boolean;

  /**
   * Sort the best score. AI will rely on best networks
   * -1 = descending. The highest the better
   * 1 = ascending. The lowest the better
   *
   * @default - -1
   * @var number - -1, 1
   */
  scoreSort?: number;

  /**
   * Number of child to produce during breed
   *
   * @default - 1
   * @var number
   */
  nbChild?: number;

  /**
   * Probability of making an absolute copy of a genomes during breed
   *
   * @default - 0.5
   * @var number - 0.0 - 1.0
   */
  crossoverFactor?: number;
}

export type INeuroevolutionConfigRequired = Required<INeuroevolutionConfig>;

export interface IExportDataData {
  score: number;
  network: INetworkData;
}

export interface IExportData {
  config: INeuroevolutionConfigRequired;
  data: IExportDataData[][];
}
