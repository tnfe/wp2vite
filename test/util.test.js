import path from 'path';
import { switchDebug, debugError, debugInfo, debugWarning } from '../src/util/debug.js';
import { compareVersion, getVersion } from '../src/util/util.js';
import { getReactProxyByMock } from '../src/util/proxy.js';
import { saveParams } from "../src/util/env.js";

const base = path.resolve('./mock');

describe("util test", () => {
  beforeAll(() => {
    switchDebug(true);
    saveParams(base, './webpack.config.js');
  });

  test('debug instance', () => {
    expect(debugError).toBeInstanceOf(Function);
  });
  test('test debug', async () => {
    debugError('error', 'test a error');
    debugInfo('info', 'test a info');
    debugWarning('warning', 'test a warning');
  });

  test('util instance', () => {
    expect(compareVersion).toBeInstanceOf(Function);
    expect(getVersion).toBeInstanceOf(Function);
  });
  test('test util compareVersion', async () => {
    const low = compareVersion('2.1.0', '3.0.2');
    expect(low).not.toBeTruthy();

    const up = compareVersion('3.1.0', '3.0.2');
    expect(up).toBeTruthy();
  });
  test('test util getVersion', async () => {
    const one = getVersion('2.1.0');
    expect(one === '2.1.0').toBeTruthy();
    const two = getVersion('^2.1.2');
    expect(two === '2.1.2').toBeTruthy();
    const three = getVersion();
    expect(three === '0.0.0').toBeTruthy();
  });

  test('proxy instance', () => {
    expect(getReactProxyByMock).toBeInstanceOf(Function);
  });
  test('test util getReactProxyByMock', async () => {
    const res = await getReactProxyByMock();
    expect(!res).toBeTruthy();
  });
});
