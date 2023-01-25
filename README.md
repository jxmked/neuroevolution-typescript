# Neuroevolution in Typescript

&nbsp;&nbsp;
[![GitHub issues](https://img.shields.io/github/issues/digitsensitive/neuroevolution-typescript.svg)](https://github.com/digitsensitive/neuroevolution-typescript/issues)
[![GitHub stars](https://img.shields.io/github/stars/digitsensitive/neuroevolution-typescript.svg)](https://github.com/digitsensitive/neuroevolution-typescript/stargazers)
![Contributions welcome](https://img.shields.io/badge/contributions-welcome-orange.svg)
[![Code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![GitHub license](https://img.shields.io/github/license/digitsensitive/neuroevolution-typescript.svg)](https://github.com/digitsensitive/neuroevolution-typescript)

## Neuroevolution

Neuroevolution, or neuro-evolution, is a form of machine learning that uses evolutionary algorithms to train artificial neural networks.
It is most commonly applied in artificial life, computer games, and evolutionary robotics. A main benefit is that neuroevolution can be applied more
widely than supervised learning algorithms, which require a syllabus of correct input-output pairs. In contrast, neuroevolution requires only a measure
of a network's performance at a task. For example, the outcome of a game (i.e. whether one player won or lost) can be easily measured without providing
labeled examples of desired strategies.


## Installation

Browser: `<script src="https://unpkg.com/ts-neuroevolution/dist/neuroevolution.js></script>`

NPM: `npm install --save ts-neuroevolution`


## Motivation

This library has been greatly influenced by [xviniette](https://github.com/xviniette/FlappyLearning).

## Configuration

```ts
interface INeuroevolutionConfig {

    // Perceptron network structure (1 hidden // layer).
    // Default: [1, [1], 1]
    network?: [number, number[], number];
    
    // Population by generation.
    // Default: 50
    population?: number;
    
    // Best networks kepts unchanged for the next generation (rate).
    // Default: 0.2
    elitism?: number;
    
    // New random networks for the next generation (rate).
    // Default: 0.2
    randomBehaviour?: number;
    
    // Mutation rate on the weights of synapses.
    // Default: 0.1
    mutationRate?: number;
    
    // Interval of the mutation changes on the synapse weight
    // Default: 0.5
    mutationRange?: number;
    
    // Latest generations saved.
    // Default: 0
    historic?: number;
    
    // Only save score (not the network).
    // Default: false
    lowHistoric?: boolean;
    
    // Sort order;
    // Values: -1 = desc, 1 = asc).
    // Default: -1
    scoreSort?: number;
    
    // Number of children by breeding.
    // Values: integer
    // Default: 1
    nbChild?: number;
    
    // Probability of making an absolute copy of weight during breed 0 - 1
    // Values: 0.0 - 1.0
    // Default: 0.5
    crossoverFactor: number;
}
```

## Recommended and Required Configurations
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES6", // Required. ES Module
    "module": "ES6", // Required. ES Module
    "moduleResolution": "node",
    "typeRoots": [
      "./node_modules"
    ],
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true
  }
}
```

## Usage

```ts
import { Neuroevolution } from 'neuroevolution-typescript';

const config = {
    ...
}

// Create an instance 
const instance: Neuroevolution = new Neuroevolution(config);

// Generate new generation
// Will return an array of generation
// The array length is based on population
const generations = instance.nextGeneration();


const input = [0,1,1];
const expected = 1;

// Do compute

for(let i = 0; i < instance.options.population; i++) {
// Will return a prediction number ranging 0 to 1
    let result = generations[i].compute(input);
    
    // Tell if is right or wrong
    instance.networkScore(generations[i], Math.ceil(result[0]) === expected);
}

// Optional
// Repeat the process from generating generations

```

***Exporting and Importing***

```ts
// Must have atleast 1 generation completed before exporting trained data

// Your trained data including the configurations
// Will export the last generation
const data = instance.exportData();

const otherNeuvol = new Neuroevolution();

// Import pretrained data


// Note: Configuration from exported data will be use

// Import first before calling
// Neuroevolution.nextGeneration() function otherwise will not work correctly
otherNeuvol.importData(data);


otherNeuvol = instance.nextGeneration();

```


## Resources

[Deep Neuroevolution: Genetic Algorithms are a Competitive Alternative for
Training Deep Neural Networks for Reinforcement Learning](https://arxiv.org/pdf/1712.06567.pdf)  

## Scripts

__Start development mode__

`npm start`, `npm run dev`

__Serve Ouput/dist folder__

`npm run serve`

Will serve [http://localhost:8080](http://localhost:8080)

__Linting__

`npm run lint` - Run lint

`npm run lint:fix` - Run lint and fix lines that linter can fix

__Test__

You can directly run `npm test` without `npm run build:test`

since `jest` will automatically compile `Typescript` to `JavaScript` 

__Builds__

- `npm run build` - Build all (except declarations and testing kit)
- `npm run build:umd` - Build Browser Version. Output file 'neuroevolution.js'
- `npm run build:node` - Build ES Node Module Version. Output file 'main.js'
- `npm run build:tsc` - Build Declaration Files. Required for ES Node Modules

__Formating__

`npm run prettier-format` - Start formating code from `./src` and `./tests` using `Prettier`

## License

This project is licensed under the MIT License - see the [LICENSE.md](https://github.com/digitsensitive/neuroevolution-typescript/blob/master/LICENSE) file for details.
