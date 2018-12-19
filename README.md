# Using a meta package to hold your dependencies

We are going to update our app to use a meta package to hold our dependencies:

In package.json, replaced all dependencies with:
 ```json
 "dependencies": {
   "my-meta-package": "file:my-meta-package"
 },
```
Create `my-meta-package` folder inside project, `npm init`, and add removed dependencies to `my-meta-package`'s `package.json`

In `./my-meta-package` have `vendor` directory, which has `$DEPENDENCY` directory that exports module.

i.e. for jquery:
``` javascript
// vendor/jquery/jquery.js
import jquery from 'jquery';
  
export default jquery;

// vendor/jquery/index.js
export { default as jquery } from './jquery';
```

This is done for each dependency, then all are exported in `my-meta-package`'s index.js

```javascript
export * from './vendor/jquery';
```

`npm run build` to build the bundles. The webpack config splits `my-meta-package` to `vendor.js` and application code to `bundle.js`
 
 With *no naming plugins* added to webpack config, webpack assigns numeric value as module identifier. We can see this in `records.json` file
 
 ```json
     "byIdentifier": {
      "node_modules/babel-loader/lib/index.js!my-meta-package/index.js 7e3949d45ab3c7431ae7f502c88d1403": 0,
      "my-meta-package/node_modules/uuid/lib/rng-browser.js": 1,
      "my-meta-package/node_modules/uuid/lib/bytesToUuid.js": 2,
      "node_modules/babel-loader/lib/index.js!app.js": 3,
      "my-meta-package/node_modules/jquery/dist/jquery.js": 4,
      "my-meta-package/node_modules/uuid/index.js": 5,
      "my-meta-package/node_modules/uuid/v1.js": 6,
      "my-meta-package/node_modules/uuid/v4.js": 7,
      "multi my-meta-package": 8
    },
```

Lets look at what webpack is specifying in `bundle.js`
```javascript
webpackJsonp(
  [0],
  {
    3: function(e, t, u) {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: !0 });
      var c = u(0);
      Object(c.jquery)(document).ready(() => {
        Object(c.jquery)("#welcome").text("welcome!"),
          Object(c.jquery)("#uuid").text(Object(c.uuid)());
      });
    }
  },
  [3]
);
```

Notice the `var c = u(0);`? If we look at `records.json`, we can see 0 is referencing `my-meta-package`
```json
  "node_modules/babel-loader/lib/index.js!my-meta-package/index.js 7e3949d45ab3c7431ae7f502c88d1403": 0,
```

From the metapackage, its dependencies are referenced by name in bundle.js i.e. `c.jquery` and `c.uuid`


What does this mean?

If we generate a new `bundle.js`, it can be used with an previously-built (but still compatible) `vendor.js` *as long as* the module identifier stays the same for `my-meta-package`


Lets see what happens we add the `SimpleNamedModule` plugin that we [currently use in Foreman](https://github.com/theforeman/foreman/blob/develop/webpack/simple_named_modules.js).

After removing the existing `records.json` and rebuilding, the `records.json` looks like this:
```json
    "byIdentifier": {
      "node_modules/babel-loader/lib/index.js!app.js": "./app.js",
      "node_modules/babel-loader/lib/index.js!my-meta-package/index.js 7e3949d45ab3c7431ae7f502c88d1403": "./my-meta-package/index.js",
      "my-meta-package/node_modules/jquery/dist/jquery.js": "node_modules/jquery/dist/jquery.js",
      "my-meta-package/node_modules/uuid/index.js": "node_modules/uuid/index.js",
      "my-meta-package/node_modules/uuid/lib/bytesToUuid.js": "node_modules/uuid/lib/bytesToUuid.js",
      "my-meta-package/node_modules/uuid/lib/rng-browser.js": "node_modules/uuid/lib/rng-browser.js",
      "my-meta-package/node_modules/uuid/v1.js": "node_modules/uuid/v1.js",
      "my-meta-package/node_modules/uuid/v4.js": "node_modules/uuid/v4.js",
      "multi my-meta-package": 0
    },
```

and the `bundle.js` looks like this

```javascript
webpackJsonp(
  [0],
  {
    "./app.js": function(e, t, c) {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: !0 });
      var u = c("./my-meta-package/index.js");
      Object(u.jquery)(document).ready(() => {
        Object(u.jquery)("#welcome").text("welcome!"),
          Object(u.jquery)("#uuid").text(Object(u.uuid)());
      });
    }
  },
  ["./app.js"]
);
```

Now webpack is using the relative module path call the meta package. `var u = c("./my-meta-package/index.js");` and still referencing that meta package's dependencies with meta package i.e `u.jquery`

In this example, as long as the path to `my-metadata-package` doesn't change, the module identifier won't change. So this means we should be able to use a new `bundle.js` file with a pre-existing `vendor.js` file.


### Using a new bundle.js with an old vendor.js
Lets try it out!

I ran `npm run build` and have index.html pulled up in the browser, which references `bundle.js` and `vendor.js`. Website looks great!

![AWESOME](https://i.imgur.com/HSN13SJ.png)

Oh no! I forgot something in the application. I can fix it easily, but then I don't want to rebuild vendor.js again. Lets see if I can just update the code and use a new `bundle.js` 

Let me move `vendor.js` since it will actually get rebuilt on the build step in this example, so we don't want it to get overwritten. (use a little suspended disbelief here)

`mv vendor.js /tmp/vendor.old.js`

Update app.js
```diff
 $(document).ready(() => {
   $('#welcome').text('welcome!');
-  $('#uuid').text(uuidv1());
+  $('#uuid').text("Your uuid is: " + uuid());
 });
```
run `npm run build` again to generate new bundles

copy over old `vendor.js` `cp /tmp/vendor.old.js vendor.js`

We are now using a newly-generated `bundle.js` with updated code with a previously-generated `vendor.js` file. Website has the updated changes:

![AWESOME2](https://i.imgur.com/YMX9VnM.png)

If we look at the bundle.js, we can see the reference to the metadata package stayed the same ` var c = u("./my-meta-package/index.js");`, but the updated application code is there:

```javascript
webpackJsonp(
  [0],
  {
    "./app.js": function(e, t, u) {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: !0 });
      var c = u("./my-meta-package/index.js");
      Object(c.jquery)(document).ready(() => {
        Object(c.jquery)("#welcome").text("welcome!"),
          Object(c.jquery)("#uuid").text("Your uuid is: " + Object(c.uuid)());
      });
    }
  },
  ["./app.js"]
);
```

Using a metadata package should allow you to re-use `vendor.js` bundles, as long as the module identifier to the metadata package does not change.


### Using a new vendor.js with old bundle.js

I've ran a build `npm run build`

Then moved bundle.js `mv bundle.js /tmp/bundle.old.js` so we can copy it back after the updated build runs.

and I'm going to copy vendor.js to diff the new vendor.js against later `cp vendor.js /tmp/vendor.js`

Now lets update the metapackage dependencies:

In 'my-metadata-package', I am going to downgrade jquery to 3.2.1, since we use the same features that are in 3.2, we should be backwards compatible. If this works, we could upgrade the package too, but since this is the latest jquery, I am downgrading the package rather than upgrading.

I'll also add a new package `date-fns`, just to ensure that adding a new package won't interfere with the compatibility

```diff
diff --git a/my-meta-package/package.json b/my-meta-package/package.json
index 6726535..934db79 100644
--- a/my-meta-package/package.json
+++ b/my-meta-package/package.json
@@ -9,7 +9,8 @@
   "author": "",
   "license": "ISC",
   "dependencies": {
-    "jquery": "^3.3.1",
+    "date-fns": "^1.30.1",
+    "jquery": "3.2.1",
     "uuid": "^3.3.2"
   }
```

I had to pin jquery to an exact version to get ensure it resolves to installing a 3.2 version rather than 3.3

I run `npm install` in both the root directory and `my-meta-package` to ensure packages are up to date

then run `npm run build`

`diff vendor.js /tmp/vendor.old.js` to ensure that the new vendor has changed.

if we `diff bundle.js /tmp/bundle.old.js` we can see it has not changed so we already know this should work, but lets copy it over for good measure

`cp /tmp/bundle.old.js  bundle.js`

If we reload the page, we can see that the page still loads fine! So this means we can use an old bundle.js against a new vendor.js provided that it is using compatible code with the versions of packages vendor.js supplies
