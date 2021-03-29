const { cac }  = require('cac');
const { start } = require('./index.js');
const { debugError} = require('./debug.js');

const cli = cac('wp2vite');

cli
  .command('[root]')
  .option('-c, --config <config>', `[string] use webpack config file`)
  .option('-t, --type <type>', `[string] use project type: create-react-app | vue-cli | other`)
  .option('-b, --base <base>', `[string] use project path: project path,default process.cwd()`)
  .option('-d, --debug [debug]', `[string | boolean] show debug logs`)
  .action(async (root, options) => {
    let base = options.base;
    if (!base) {
      base = process.cwd();
    }
    try {
      await start({
        config: options.config,
        type: options.type,
        base: base,
        debug: options.debug
      })
    } catch (e) {
      debugError(`error during build:\n${e.stack}`)
      process.exit(1)
    }
  })



cli.help()
cli.version(require('../../package.json').version)

cli.parse()