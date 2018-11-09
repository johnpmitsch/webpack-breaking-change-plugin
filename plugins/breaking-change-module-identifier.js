const md5 = require('md5');

class BreakingChangeModuleIdentifier {
  constructor(options) {
    this.options = options || {};
  }

  apply(compiler) {
    compiler.plugin('normal-module-factory', normalModuleFactory => {
      normalModuleFactory.plugin('after-resolve', (data, callback) => {
        const metadata = data.resourceResolveData.descriptionFileData;
        normalModuleFactory.plugin('create-module', (result) => {
          result.rawRequest = metadata;
        });
        callback(null, data);
      });
    });

    compiler.plugin("compilation", (compilation) => {
      compilation.plugin("before-module-ids", (modules) => {
        modules.map(module => {
          if (module.rawRequest) {
            const moduleData = createModuleData(module.rawRequest); 
            module.id = md5(moduleData);
          }
        });
      });
    });
  }
};

const createModuleData = (rawRequest) => {
  let moduleData = "";
  const { name, author, version } = rawRequest;
  if (name) moduleData += name
  if (author) {
    if (typeof author === 'string')  {
      moduleData += author
    } else if (author.name) {
      moduleData += author.name;
    }
  }
  const [x, y, z] = version.split('.');
  if (x) moduleData += x;
  if (y) moduleData += y;
  return moduleData;
};

module.exports = BreakingChangeModuleIdentifier;
