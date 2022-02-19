import { MatchImageSnapshotOptions } from 'jest-image-snapshot';
type RetryOptions = {retryCounter?: number; retryWaitingTime?: number}
export type SnapshotOptions = Partial<Cypress.ScreenshotOptions> &
  MatchImageSnapshotOptions & RetryOptions;

declare global {
  namespace Cypress {
    interface Chainable {
      matchImageSnapshot(): void;
      matchImageSnapshot(name: string): void;
      matchImageSnapshot(options: SnapshotOptions): void;
      matchImageSnapshot(name: string, options: SnapshotOptions): void;
    }
  }
}

export type MatchTaskOptions = {
  screenshotsFolder: string;
  updateSnapshots: boolean;
  options: SnapshotOptions;
};

export type DiffImageToSnapshot = (args: {
  snapshotsDir: string;
  diffDir: string;
  receivedImageBuffer: Buffer;
  snapshotIdentifier: string;
  failureThreshold?: number;
  failureThresholdType?: 'pixel' | 'percent';
  updateSnapshot: boolean;
}) => DiffImageToSnapshotResult;

/**
 * Reverse engineered from https://github.com/americanexpress/jest-image-snapshot/blob/2ef1ca810e60c4aa9951e1f373744dd05938e4cb/src/diff-snapshot.js
 */
export type DiffImageToSnapshotResult = {
  pass: boolean;
  added: boolean;
  updated: boolean;
  diffSize: boolean;
  imageDimensions: {
    receivedHeight: number;
    receivedWidth: number;
    baselineHeight: number;
    baselineWidth: number;
  };
  diffRatio: number;
  diffPixelCount: number;
  diffOutputPath: string;
};
