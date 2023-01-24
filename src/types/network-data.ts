export interface INetworkData {
    // Array with the number of neurons in each layer
    // [A,B, ...]
    // A is the number of neurons in the first layer
    // B is the number of neurons in the second layer
    // ...
    neurons: number[];

    // Plain array with the weights of each neuron input
    weights: number[];
}
