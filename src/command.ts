/**
 * Copyright (c) 2018-present The Palmer Group
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { MATCH, RECORD } from './constants';
import {
  DiffImageToSnapshotResult,
  MatchTaskOptions,
  SnapshotOptions,
} from './types';

const screenshotsFolder = Cypress.config('screenshotsFolder');
const updateSnapshots = Cypress.env('updateSnapshots') || false;
const failOnSnapshotDiff =
  typeof Cypress.env('failOnSnapshotDiff') === 'undefined';

interface MatchImageSnapshotFn {
  (subject: unknown): Cypress.Chainable;
  (subject: unknown, name: string): Cypress.Chainable;
  (subject: unknown, commandOptions: SnapshotOptions): Cypress.Chainable;
  (
    subject: unknown,
    name: string,
    commandOptions?: SnapshotOptions
  ): Cypress.Chainable;
}

export function matchImageSnapshotCommand(defaultOptions?: SnapshotOptions) {
  const matchImageSnapshot: MatchImageSnapshotFn = (
    subject: unknown,
    maybeName?: string | SnapshotOptions,
    commandOptions?: SnapshotOptions
  ) => {
    const options = {
      ...defaultOptions,
      ...((typeof maybeName === 'string' ? commandOptions : maybeName) ?? {}),
    };

    if (screenshotsFolder === false) {
      throw new Error(
        `could not read screenshots folder path (Cypress.config('screenshotsFolder'))`
      );
    }

    const matchTaskOptions: MatchTaskOptions = {
      screenshotsFolder,
      updateSnapshots,
      options,
    };

    cy.task(MATCH, matchTaskOptions);

    const name = typeof maybeName === 'string' ? maybeName : undefined;
    const target = subject ? cy.wrap(subject) : cy;
    if (name === undefined) {
      target.screenshot(options);
    } else {
      target.screenshot(name, options);
    }

    return cy.task(RECORD).then((taskResult) => {
      const {
        pass,
        added,
        updated,
        diffSize,
        imageDimensions,
        diffRatio,
        diffPixelCount,
        diffOutputPath,
      } = taskResult as DiffImageToSnapshotResult;

      if (!pass && !added && !updated) {
        if (options.retryCounter && options.retryCounter > 0) {
          const newCommandOptions = {
            ...commandOptions,
            retryCounter: options.retryCounter - 1,
          };
          cy.wait(newCommandOptions.retryWaitingTime ?? 100);
          return name ? matchImageSnapshot(subject, name, newCommandOptions) : matchImageSnapshot(subject, newCommandOptions);
        }
        const message = diffSize
          ? `Image size (${imageDimensions.baselineWidth}x${imageDimensions.baselineHeight}) different than saved snapshot size (${imageDimensions.receivedWidth}x${imageDimensions.receivedHeight}).\nSee diff for details: ${diffOutputPath}`
          : `Image was ${
              diffRatio * 100
            }% different from saved snapshot with ${diffPixelCount} different pixels.\nSee diff for details: ${diffOutputPath}`;

        if (failOnSnapshotDiff) {
          throw new Error(message);
        } else {
          Cypress.log({ message });
        }
      }
    });
  };

  return matchImageSnapshot;
}

interface AddMatchImageSnapshotCommandFn {
  (options: SnapshotOptions): void;
  (name: string, options: SnapshotOptions): void;
}

export const addMatchImageSnapshotCommand: AddMatchImageSnapshotCommandFn = (
  maybeName: string | SnapshotOptions = 'matchImageSnapshot',
  maybeOptions?: SnapshotOptions
) => {
  const options = typeof maybeName === 'string' ? maybeOptions : maybeName;
  const name = typeof maybeName === 'string' ? maybeName : 'matchImageSnapshot';
  Cypress.Commands.add(
    name,
    {
      prevSubject: ['optional', 'element', 'window', 'document'],
    },
    matchImageSnapshotCommand(options)
  );
};
