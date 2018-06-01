/**
 * Stores data as JSON files under a topic and an id. Each topic maps to a
 * directory and each id maps to a filename. All methods are synchronous.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const UTF8 = 'utf8';
const ENOENT = 'ENOENT';
const ENOTEMPTY = 'ENOTEMPTY';
const EXTENSION = '.json';

class JsonStore {
  /**
   * Creates a new JsonStore instance using the specified base directory, which
   * must be an absolute path, as the storage location for all data.
   */
  constructor(basedir) {
    _checkNonEmptyString(basedir, 'basedir');
    _checkAbsolutePath(basedir, 'basedir');
    this._basedir = basedir;
  }

  /**
   * Reads the data for the specified topic and id.
   * Returns undefined if not found.
   */
  get(topic, id) {
    _checkNonEmptyString(topic, 'topic');
    _checkNonEmptyString(id, 'id');
    try {
      return this._readFile(this._pathname(topic, id));
    } catch (err) {
      if (err.code === ENOENT) {
        return undefined;
      } else {
        throw err;
      }
    }
  }

  /**
   * Writes the data for the specified topic and id.
   */
  put(topic, id, data) {
    _checkNonEmptyString(topic, 'topic');
    _checkNonEmptyString(id, 'id');
    _checkDefined(data, 'data');
    _mkdirs(this._dirname(topic)); // ensure directory exists
    this._writeFile(this._pathname(topic, id), data);
  }

  /**
   * Returns the ids for the specified topic.
   */
  ids(topic) {
    _checkNonEmptyString(topic, 'topic');
    const ids = [];
    this._processFiles(topic, (pathname, id) => {
      ids.push(id);
    });
    return ids;
  }

  /**
   * Returns an object containing all items for the specified topic.
   * The returned object has the ids as keys and the data as values.
   */
  all(topic) {
    _checkNonEmptyString(topic, 'topic');
    const all = {};
    this._processFiles(topic, (pathname, id) => {
      const data = this._readFile(pathname);
      all[id] = data;
    });
    return all;
  }

  /**
   * Returns an array of all items for the specifiec topic. This is the same
   * as getting the values for the data returned by the all(topic) method.
   */
  values(topic) {
    _checkNonEmptyString(topic, 'topic');
    const values = [];
    this._processFiles(topic, (pathname, id) => {
      const data = this._readFile(pathname);
      values.push(data);
    });
    return values;
  }

  /**
   * Moves the files specified by the topic and the ids to a new topic. If ids
   * is a string instead of an array, then only that one file is moved. The
   * directory corresponding to the topic is deleted if empty. Returns an array
   * of moved ids regardless of the ids argument being a string or an array.
   */
  move(topic, ids, newTopic) {
    if (typeof ids === 'string') {
      ids = [ids];
    }
    _checkNonEmptyString(topic, 'topic');
    _checkArray(ids);
    _checkNonEmptyString(newTopic, 'newTopic');
    const moved = [];
    ids.forEach(id => {
      const data = this.get(topic, id);
      if (data !== undefined) {
        this.put(newTopic, id, data);
        moved.push(id);
      }
    });
    this.delete(topic, moved);
    return moved;
  }

  /**
   * Deletes the files specified by the topic and the ids. If ids is a string
   * instead of an array, then only that one file is deleted. The directory
   * corresponding to the topic is deleted if empty. Returns an array of deleted
   * ids regardless of the ids argument being a string or an array.
   */
  delete(topic, ids) {
    if (typeof ids === 'string') {
      ids = [ids];
    }
    _checkNonEmptyString(topic, 'topic');
    _checkArray(ids);
    const deleted = [];
    ids.forEach(id => {
      try {
        fs.unlinkSync(this._pathname(topic, id));
        deleted.push(id);
      } catch (err) {
        if (err.code !== ENOENT) {
          throw err;
        }
      }
    });
    this._deleteTopicIfEmpty(topic);
    return deleted;
  }

  /**
   * Deletes all files for the specified topic.
   * The directory corresponding to the topic is deleted if empty.
   * Returns an array of all removed ids.
   */
  clean(topic) {
    _checkNonEmptyString(topic, 'topic');
    const removed = [];
    this._processFiles(topic, (pathname, id) => {
      fs.unlinkSync(pathname);
      removed.push(id);
    });
    this._deleteTopicIfEmpty(topic);
    return removed;
  }

  _dirname(topic) {
    return path.resolve(this._basedir, topic);
  }

  _pathname(topic, id) {
    return path.resolve(this._basedir, topic, id + EXTENSION);
  }

  _readFile(pathname) {
    const text = fs.readFileSync(pathname, UTF8);
    return JSON.parse(text);
  }

  _writeFile(pathname, data) {
    const text = JSON.stringify(data, null, 2);
    fs.writeFileSync(pathname, text, UTF8);
  }

  _processFiles(topic, callback) {
    try {
      const filenames = fs.readdirSync(this._dirname(topic));
      filenames.forEach(filename => {
        if (filename.endsWith(EXTENSION)) {
          const pathname = path.resolve(this._basedir, topic, filename);
          const id = path.basename(filename, EXTENSION);
          callback(pathname, id);
        }
      });
    } catch (err) {
      if (err.code === ENOENT) {
        return; // no such topic - don't process any files
      } else {
        throw err;
      }
    }
  }

  _deleteTopicIfEmpty(topic) {
    try {
      fs.rmdirSync(this._dirname(topic));
    } catch (err) {
      const ok = err.code === ENOENT || err.code === ENOTEMPTY;
      if (!ok) {
        throw err;
      }
    }
  }
}

function _checkDefined(x, arg) {
  if (x !== undefined) return;
  throw new TypeError(`'${arg}' must be defined`);
}

function _checkNonEmptyString(x, arg) {
  if (typeof x === 'string' && x.length > 0) return;
  throw new TypeError(`'${arg}' must be a non-empty string`);
}

function _checkAbsolutePath(x, arg) {
  if (path.isAbsolute(x)) return;
  throw new TypeError(`'${arg}' must be an absolute path (got '${x}' instead)`);
}

function _checkArray(x, arg) {
  if (Array.isArray(x)) return;
  throw new TypeError(`'${arg}' must be an array`);
}

function _mkdirs(dir) {
  if (fs.existsSync(dir)) {
    if (fs.statSync(dir).isDirectory()) {
      return;
    }
    throw new Error(`Not a directory: '${dir}'`);
  }
  var i = dir.lastIndexOf(path.sep);
  if (i < 0) {
    throw new Error(`No parent directory: '${dir}'`);
  }
  _mkdirs(dir.substring(0, i));
  fs.mkdirSync(dir);
}

module.exports = JsonStore;
