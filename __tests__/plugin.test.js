/**
 * Copyright (c) 2018-present The Palmer Group
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const path = require('path');
const {
  diffImageToSnapshot,
} = require('jest-image-snapshot/src/diff-snapshot');
const {
  matchImageSnapshotStart,
  matchImageSnapshotPlugin,
} = require('../lib/plugin');

jest.mock('jest-image-snapshot/src/diff-snapshot', () => ({
  diffImageToSnapshot: jest
    .fn()
    .mockReturnValue({ diffOutputPath: '/path/to/diff' }),
}));
jest.mock('fs-extra', () => ({
  readFileSync: () => 'cheese',
  pathExistsSync: () => false,
  copySync: () => null,
  removeSync: () => null,
}));

describe('plugin', () => {
  it('should pass options through', () => {
    const originalCwd = process.cwd;
    process.cwd = () => '';

    const options = {
      screenshotsFolder: '/cypress/screenshots',
      updateSnapshots: true,
    };

    matchImageSnapshotStart(options);

    const result = matchImageSnapshotPlugin({
      path: path.join('/', 'cypress', 'screenshots', 'path', 'to', 'cheese'),
    });

    expect(result).toEqual({
      path: path.join(
        '/',
        'cypress',
        'snapshots',
        'path',
        'to',
        '__diff_output__',
        'cheese.diff.png'
      ),
    });
    expect(diffImageToSnapshot).toHaveBeenCalledWith({
      snapshotsDir: path.join('/', 'cypress', 'snapshots', 'path', 'to'),
      diffDir: path.join(
        '/',
        'cypress',
        'snapshots',
        'path',
        'to',
        '__diff_output__'
      ),
      updateSnapshot: true,
      receivedImageBuffer: 'cheese',
      snapshotIdentifier: 'cheese',
      failureThreshold: 0,
      failureThresholdType: 'pixel',
    });

    process.cwd = originalCwd;
  });
});
