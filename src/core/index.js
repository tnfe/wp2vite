
const { projectType, webpackPath } = require('./constant.js');
const doWithCra = require('./main/cra.js')
const doWithVue = require('./main/vue.js')
const doOther = require('./main/other.js')

async function start({ config, type, base, debug }) {
  if (type) {
    switch (type) {
      case projectType.cra:
        await doWithCra(base, config);
        break;
      case projectType.vue:
        doWithVue(base, webpackPath.vue);
        break;
      case projectType.other:
        if (!config) {
          throw new Error('other transform must has config params');
        }
        doOther(base, config);
        break;
    }
  } else {
    doOther(config);
  }
}

module.exports = {
  start
}