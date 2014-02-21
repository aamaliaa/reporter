Reporter-App Client Library
============================

This is a Javascript client library for [Reporter App](http://www.reporter-app.com) data from Dropbox with Node.js. It uses the awesome q async library (https://github.com/kriskowal/q).

It's also still very much **in progress**.

#### Set up
1. Create an app in the developers section of Dropbox with access to only your text files.
2. Add `http://localhost:8912/oauth_callback` as an OAuth redirect URI.
3. Add your Dropbox key and secret to `config/index.js`.
3. Run `npm install` in app directory.
4. Run `node index.js`.
5. Navigate to [localhost:3004](localhost:3004) from your browser.
6. Add returned token to `config/index.js`.

#### TO DO
* incorporate json querying (maybe [json-query](https://www.npmjs.org/package/json-query) or [jsonquery](https://www.npmjs.org/package/jsonquery))
* turn into Node module (via npm)

MIT License
===============

Copyright (c) 2014 Amalia Viti

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.