# @binhpv/cypress-image-snapshot

This is a fork of [pkerschbaum/cypress-image-snapshot](https://github.com/pkerschbaum/cypress-image-snapshot) with following changes applied:

- Revert the relative snapshot folder since it's too hard to many many files.

## Installation

Using npm:

```bash
npm install --save-dev @binhpv/cypress-image-snapshot jest-image-snapshot
```

Using yarn:

```bash
yarn add --dev @binhpv/cypress-image-snapshot jest-image-snapshot
```

then add the following in your project's `<rootDir>/cypress/plugins/index.js`:

```js
import { addMatchImageSnapshotPlugin } from '@binhpv/cypress-image-snapshot/lib/plugin';

module.exports = (on, config) => {
  addMatchImageSnapshotPlugin(on, config);
};
```

and in `<rootDir>/cypress/support/commands.js` add:

```js
import { addMatchImageSnapshotCommand } from '@binhpv/cypress-image-snapshot/lib/command';

addMatchImageSnapshotCommand();
```

## Syntax, Usage, ...

See [jaredpalmer/cypress-image-snapshot](https://github.com/jaredpalmer/cypress-image-snapshot).
