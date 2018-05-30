# json-store

Stores data as JSON files under a topic and an id. Each topic maps to a directory and each id maps to a filename. All methods are synchronous.

## Usage

```bash
npm install @be/json-store
```

```javascript
const path = require('path');
const JsonStore = require('@be/json-store');

const basedir = path.resolve(__dirname, 'data');
// The base directory must be absolute

const store = new JsonStore(basedir);

store.put('colors', 'red', 'The color red');
store.put('colors', 'green', 'The color green');
store.put('colors', 'blue', 'The color blue');

console.log(store.get('colors', 'red'));
// Logs 'The color red'

console.log(store.get('fruits', 'red'));
// Logs null (no such topic)

console.log(store.get('colors', 'yellow'));
// Logs null (no such id)

console.log(store.all('colors'));
// Logs { blue: 'The color blue', green: 'The color green', red: 'The color red' }

console.log(store.all('fruits'));
// Logs {} (no such topic)

console.log(store.values('colors'));
// Logs [ 'The color blue', 'The color green', 'The color red' ]

console.log(store.all('fruits'));
// Logs [] (no such topic)

console.log(store.delete('colors', 'red'));
// Logs true (the file was deleted)

console.log(store.purge('colors', ['red', 'green', 'blue']));
// Logs [ 'blue', 'green' ] (red was already deleted)

console.log(store.clean('colors'));
// Logs [] (but the colors directory is also removed by clean)
```

## Testing

Run `npm test` to perform unit testing.

## API

### new JsonStore(basedir, extension)

Creates a new JsonStore instance using the specified base directory, which *must* be an absolute path, as the storage location for all data.

### get(topic, id)

Reads the data for the specified topic and id. Returns null if not found.

### put(topic, id, data)

Writes the data for the specified topic and id.

### ids(topic)

Returns the ids for the specified topic.

### all(topic)

Returns an object containing all items for the specified topic. The returned object has the ids as keys and the data as values.

### values(topic)

Returns an array of all items for the specifiec topic. This is the same as getting the values for the data returned by the all(topic) method.

### delete(topic, id)

Deletes the file specified by the topic and the id. Returns true if the file was deleted. Otherwise, false is returned if the file does not exist.

### purge(topic, ids)

Deletes all files for the specified topic and array of ids. Returns an array of all removed ids.

### clean(topic)

Deletes all files for the specified topic. The directory corresponding to the topic is deleted if empty. Returns an array of all removed ids.

## License

MIT License

Copyright (c) 2018 Buchanan & Edwards

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
