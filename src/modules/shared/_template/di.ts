/**
 * Module Dependency Injection Container
 *
 * This file is the factory for all module dependencies.
 * Copy this file when creating a new module and register your repositories.
 */

// Example:
// import { ExampleRepository } from './src/data/repositories/ExampleRepository';
// import type { IExampleRepository } from './src/domain/interfaces/IExampleRepository';

export interface TemplateContainer {
  // exampleRepository: IExampleRepository;
  _init?: boolean;
}

export const createTemplateContainer = (): TemplateContainer => ({
  // exampleRepository: new ExampleRepository(),
});

export const container = createTemplateContainer();
