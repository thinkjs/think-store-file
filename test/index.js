/*
* @Author: lushijie
* @Date:   2017-03-16 09:23:29
* @Last Modified by:   lushijie
* @Last Modified time: 2017-03-17 13:58:06
*/
import test from 'ava';
import helper from 'think-helper';
import path from 'path';
import fs from 'fs';
import FileCache from '../index';

let myOptions = {
  timeout: 3600,
  fileExt: '.txt',
  cachePath: path.join(__dirname, 'cache'),
  pathDepth: 1
};


function getCacheFilePath(key, config) {
  let cacheFileDir = helper.md5(key).slice(0, config.pathDepth).split('').join(path.sep);
  return path.join(__dirname, 'cache', cacheFileDir, helper.md5(key)) +config.fileExt;
}

// del cache dir after every test case
test.serial.cb.afterEach(t => {
  let cachePath = path.join(__dirname, 'cache');
  helper.rmdir(cachePath, false).then(() => {
    t.end();
  });
});

test.serial('set key & get key & del key', async t => {
  let key = 'name';
  let config = helper.extend({}, myOptions);
  let cacheInst = new FileCache(config);
  await cacheInst.set(key, 'thinkjs');
  let ret1 = await cacheInst.get(key);
  await cacheInst.delete(key);
  let ret2 = await cacheInst.get(key);

  t.true(ret1 === 'thinkjs' && ret2 === undefined);
});

test.serial('set key & get key without pathDepth', async t => {
  let key = 'name';
  let config = helper.extend({}, myOptions, {pathDepth: null});
  let cacheInst = new FileCache(config);
  await cacheInst.set(key, 'thinkjs');
  let ret1 = await cacheInst.get(key);
  t.true(ret1 === 'thinkjs');
});

test.serial('get expired key', async t => {
  let key = 'name1';
  let config = helper.extend({}, myOptions);
  let cacheInst = new FileCache(config);
  await cacheInst.set(key, 'thinkjs', -1);
  let ret = await cacheInst.get(key);

  t.true(ret === undefined);
});

test.serial('get key with error', async t => {
  let config = helper.extend({}, myOptions);
  let key = 'name1';
  let cacheInst = new FileCache(config);
  await cacheInst.set(key, 'thinkjs');

  // modify the file
  let cacheFilePath = getCacheFilePath(key, config);
  fs.writeFileSync(cacheFilePath, 'Hello World');

  let ret = await cacheInst.get(key);
  t.true(ret === undefined);
});

test.serial('gc & gc when error', async t => {
  let key1 = 'name1';
  let key2 = 'name2';
  let config1 = helper.extend({}, myOptions);
  let cacheInst1 = new FileCache(config1);
  await cacheInst1.set(key1, 'thinkjs', -1);
  await cacheInst1.set(key2, 'thinkjs');
  // let cacheFilePath2 = getCacheFilePath(key2, config1);
  // fs.writeFileSync(cacheFilePath2, 'Hello World}');
  Promise.all(cacheInst1.gc()).then(async () => {
    let cacheExpiredPath = getCacheFilePath(key1, config1);
    t.true(!helper.isFile(cacheExpiredPath));

    // modify the file
    // await cacheInst1.set(key1, 'thinkjs', -1);
    // let cacheFilePath = getCacheFilePath(key1, config1);
    // fs.writeFileSync(cacheFilePath, 'Hello World');
    // Promise.all(cacheInst1.gc()).then(() => {
    //   let cacheExpiredPath = getCacheFilePath(key1, config1);
    //   t.true(!helper.isFile(cacheExpiredPath));
    // });
  });
});
