/**
 * @author       Digitsensitive <digit.sensitivee@gmail.com>
 * @copyright    2017 - 2019 Digitsensitive
 * @description  Neuroevolution: Neuroevolution config interface
 * @license      Digitsensitive
 */

import { INetworkData } from './network-data';

export interface INeuroevolutionConfig {
    network?: (number | number[])[];
    population?: number;
    elitism?: number;
    randomBehaviour?: number;
    mutationRate?: number;
    mutationRange?: number;
    historic?: number;
    lowHistoric?: boolean;
    scoreSort?: number;
    nbChild?: number;
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
