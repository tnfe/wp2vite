const { cac }  = require('cac');
const { start } = require('./start.js');
const { debugError} = require('../util/debug.js');

const cli = cac('wp2vite');

cli
  .command('[root]')
  .alias('alias')
  .option('-c, --config <config>', `[string] use webpack config file`)
  .option('-b, --base <base>', `[string] use project path: project path,default process.cwd()`)
  .option('-d, --debug <debug>', `[string | boolean] show debug logs`)
  .option('-f, --force <force>', `[string | boolean] show debug logs`)
  .action(async (root, options) => {
    let base = options.base;
    if (!base) {
      base = process.cwd();
    }
    if (!options.force) {
      options.force = false;
    }
    options.debug = true //!!options.debug;
    try {
      await start(base, options);
    } catch (e) {
      debugError(`error during build:\n${e.stack}`)
      process.exit(1)
    }
  });
cli.help();
cli.version(require('../../package.json').version);

cli.parse();
