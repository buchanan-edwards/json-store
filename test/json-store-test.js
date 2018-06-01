const fs = require('fs');
const path = require('path');
const assert = require('assert');
const JsonStore = require('../json-store');

const BASEDIR = path.resolve(__dirname, 'data');

describe('JsonStore', function() {
  let store = null;
  describe('constructor', function() {
    it('should create a new JsonStore instance', function() {
      store = new JsonStore(BASEDIR);
    });
    it('should not allow a relative base directory path', function() {
      assert.throws(function() {
        new JsonStore('data');
      });
    });
  });
  describe('put', function() {
    it('should create three json files', function() {
      store.put('colors', 'red', 'The color red');
      store.put('colors', 'green', 'The color green');
      store.put('colors', 'blue', 'The color blue');
    });
  });
  describe('get', function() {
    it('should read one of the json files', function() {
      const data = store.get('colors', 'red');
      assert(data === 'The color red');
    });
    it('should return undefined for an invalid topic', function() {
      const data = store.get('fruits', 'red');
      assert(data === undefined);
    });
    it('should return undefined for an invalid id', function() {
      const data = store.get('colors', 'yellow');
      assert(data === undefined);
    });
  });
  describe('ids', function() {
    it('should get all of the ids', function() {
      const ids = store.ids('colors');
      ids.sort();
      assert.deepStrictEqual(ids, ['blue', 'green', 'red']);
    });
  });
  describe('all', function() {
    it('should read all of the json files', function() {
      const all = store.all('colors');
      assert.deepStrictEqual(all, {
        red: 'The color red',
        green: 'The color green',
        blue: 'The color blue'
      });
    });
    it('should return an empty object for an invalid topic', function() {
      const all = store.all('fruits');
      assert.deepStrictEqual(all, {});
    });
  });
  describe('values', function() {
    it('should read the values of all of the json files', function() {
      const values = store.values('colors');
      values.sort();
      assert.deepStrictEqual(values, ['The color blue', 'The color green', 'The color red']);
    });
    it('should return an empty array for an invalid topic', function() {
      const values = store.values('fruits');
      assert.deepStrictEqual(values, []);
    });
  });
  describe('move', function() {
    it('should move files from one topic to another', function() {
      store.move('colors', 'red', 'moved');
      store.move('colors', 'blue', 'moved');
      assert(store.get('colors', 'red') === undefined);
      assert(store.get('colors', 'blue') === undefined);
      assert(store.get('moved', 'red') === 'The color red');
      assert(store.get('moved', 'blue') === 'The color blue');
      const moved = store.move('moved', ['red', 'blue'], 'colors');
      assert.deepStrictEqual(moved.sort(), ['blue', 'red']);
      assert(store.get('colors', 'red') === 'The color red');
      assert(store.get('colors', 'blue') === 'The color blue');
      assert(store.get('moved', 'red') === undefined);
      assert(store.get('moved', 'blue') === undefined);
    });
  });
  describe('delete', function() {
    it('should remove files from a topic', function() {
      let deleted = store.delete('colors', 'red');
      assert.deepStrictEqual(deleted, ['red']);
      deleted = store.delete('colors', 'red');
      assert.deepStrictEqual(deleted, []);
      let values = store.values('colors');
      assert(values.length === 2);
      deleted = store.delete('no-such-topic', 'no-such-id');
      assert.deepStrictEqual(deleted, []);
      deleted = store.delete('colors', ['red', 'green', 'blue']);
      assert.deepStrictEqual(deleted.sort(), ['blue', 'green']);
      values = store.values('colors');
      assert.deepStrictEqual(values, []);
    });
  });
  describe('clean', function() {
    it('should remove all files and the directory', function() {
      store.put('colors', 'yellow', 'The color yellow');
      const removed = store.clean('colors');
      assert.deepStrictEqual(removed, ['yellow']);
      fs.rmdirSync(BASEDIR);
    });
  });
});
