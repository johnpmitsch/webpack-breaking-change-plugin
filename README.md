## Webpack test repo ##

### For testing out webpack configurations/plugins ###

To build use ```npm run build```

`npm run build` creates two bundles: bundle.js (app code) and vendor.js (third-party code)

This uses a webpack plugin to create a hash based on the name, author, major version, and minor version of a package. This plugin is used as a module identifier.

The idea is, if a build of vendor.js doesn't alter the patch (z in x.y.z) versions of any packages, it should be consistent with any existing bundles. 

In addition to the bundles webpack creates a records.json file, which shows module identifiers.


To test out the concept do the following:
1. `npm i`
1. `npm run build`
2. `cp records.json /tmp/records.json`
3. change the z-version of a package in package.json, i.e. change jquery from 3.3.1 to 3.3.0
4. `npm i`
5. `npm run build`
6. `diff records.json /tmp/record.old.json` There should be no difference here as no major or minor versions were changed.
7. change the y-version of a package in package.json, i.e. change jquery from 3.3.0 to 3.2.0
8. `npm i`
5. `npm run build`
6. `diff records.json /tmp/record.old.json`  Now you should see a difference in hashes since the a y-version has changed.
