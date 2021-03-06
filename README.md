# WovenJS


[![npm](https://img.shields.io/npm/v/woven-js.svg?style=plastic)](https://www.npmjs.com/package/woven-js)
[![npm](https://img.shields.io/npm/dt/package/woven-js.svg?style=plastic)](https://img.shields.io/npm/dt/package/woven-js.svg)
[![Github All Releases](https://img.shields.io/github/downloads/CSdare/woven-js/total.svg?style=plastic)](https://github.com/CSdare/woven-js)
[![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/CSdare/woven-js.svg?style=plastic)](https://github.com/CSdare/woven-js)
[![license](https://img.shields.io/github/license/CSdare/woven-js.svg?style=plastic)](https://github.com/CSdare/woven-js)
[![GitHub release](https://img.shields.io/github/release/CSdare/woven-js.svg?style=plastic)](https://github.com/CSdare/woven-js)
[![GitHub Release Date](https://img.shields.io/github/release-date/CSdare/woven-js.svg?style=plastic)](https://github.com/CSdare/woven-js)


<p align="left">
  <img src="https://user-images.githubusercontent.com/4038732/35308567-17f72930-005d-11e8-9134-c21c741f0cc7.png">
</p>

WovenJS abstracts away the architectural complexity of multi-threading and utilizes optimization metrics to guide your application through the most performant process. Based on client hardware information and network strength, WovenJS dynamically runs intensive processes on the server or on the client. When running on the client, WovenJS leverages the Web Workers API to prevent blocking of the web browser's single thread.


## Installing
First `npm install` woven-js in your web application 

```
npm install --save woven-js
npm install --save-dev woven-loader worker-loader babel-loader webpack
```

Next, in your express server file, insert the following:

```javascript
// server.js

const app = require('express')();
const woven = require('woven-js');
const functionsPath = /* 'path to your functions file' */;

woven.configure(functionsPath, { /* client options */ });
app.use(woven.optimize);

```
In the front end of your app:

```javascript
// app.js

import Woven from 'woven-js/client';
import wovenWorker from 'worker-loader?inline=true&name=woven-worker.js!babel-loader!woven-loader!<path to your functions>';

const woven = new Woven();

woven.connect(wovenWorker);

woven.run('function name', payload)
  .then(output => {
    /* do something with output */
  });

```
**Be sure** to include the path to your functions file in the wovenWorker import! This gets your functions into the bundle. Also be sure you have Webpack installed as a dev dependency, as `woven-loader` relies on Webpack to work.

In order to work properly, your `functions.js` file will need to contain only pure functions that can run in Node or on the browser. Avoid relying on core Node or browser libraries. Also, your functions file will need to export all of its functions:

```javascript
// functions.js

const funcOne = (a, b) => {
  return a + b;
}

const funcTwo = (a) => {
  return a * 2;
}

module.exports = { funcOne, funcTwo };
```

## Usage

<p>
  <img src="https://user-images.githubusercontent.com/4038732/35308543-0315f870-005d-11e8-82fa-17aede333138.png">
  &nbsp &nbsp &nbsp &nbsp

The `woven.configure()` method links the back end with the project's pure functions.

```javascript
woven.configure(functionsPath, { /* client options */ });
```
The options object accessible through the configure method also allows for developer customizations:
 
```javascript
{
  alwaysClient: false,
  alwaysServer: false,
  dynamicMax: 500,
  fallback: 'server',
  maxChildThreads: os.cpus().length,
  maxWorkerThreads: 12,
  pingSize: 'small',
  useChildProcess: true,
  useWebWorkers: true,
};
```

#### Developer Customization Options:

  - **alwaysClient/alwaysServer:** An optimization override to run processes only on the server or the client, as opposed to letting the WovenJS optimal performance heuristic decide. 

  - **dynamicMax:** WovenJS's dynamic ping is used to determine the data transmission speed of your server->client connection. This property allows you to set a minimum response time in milliseconds. If the dynamic ping is slower than this threshold, the client will be used for processing.

  - **fallback:** In the event that the optimization process fails, WovenJS will route to the fallback assigned here. Unless modified by the developer the default fallback is to process on the server.

  - **maxWorkerThreads:** A developer override to set the maximum # of Web Worker threads that can be created for a every client.

  - **maxChildThreads:** A developer override to set the maximum # of child process threads that can be run concurrently on the serer (defaults to number of CPU's).

  - **pingSize:** Use this property to set an exact size for the dynamic ping data in bytes or choose between WovenJS's preset options: `'tiny'`(100bytes), `'small'`(4kB), `'medium'`(50kB), `'large'`(400kB), or `'huge'`(1MB).

  - **useChildProcess/useWebWorkers:** Use these properties to turn on or off using child processes on the server or Web Workers on the client. Default for both is true.

  Make sure that your server/application can handle the larger data transfer (400KB-1MB) before using the large/huge ping size presets.
  
  <img src="https://user-images.githubusercontent.com/4038732/35308546-05bdf154-005d-11e8-9877-ceabb6a07424.png">

  The `woven.connect()` method is invoked on the client side to establish a connection between the client and the server. 

  ```javascript
  woven.connect(/* workerFile */);
  ```

  `woven.connect()` triggers the WovenJS’s optimize middleware to set the optimization configuration for each client’s connection. Additionally it takes in the reference to the imported Web Workers file so that WovenJS can spawn workers as needed.

  <img src="https://user-images.githubusercontent.com/4038732/35308554-09e7228c-005d-11e8-9329-f49ab7580292.png">

  WovenJS sends an auto-generated dynamic ping to capture data transmission speed for each client's connection. The dynamic ping should be proportionate to the application's functonality (for example, set the dynamic ping to the size of a JPG for an app that relies heavily on image file transfers). 
  
  If the dynamic ping is slower than the `dynamicMax` threshold, the client will be used for processing. If it's faster, the server will be used.
  
  <img src="https://user-images.githubusercontent.com/4038732/35308551-07f95ea4-005d-11e8-8d81-4b8ade2db02f.png">
  
  WovenJS's optimization process evaluates the most performant processing location depending on the hardware, software, and network capabilities of the client-side device. WovenJS will automatically route processing to the server or the client depending on what location will result in the fastest most performant client experience.

  <img src="https://user-images.githubusercontent.com/4038732/35312963-d4709d20-0072-11e8-80f2-57423e8ac1d1.png">
 
  Use the `woven.run()` function wherever you want to run one of the functions in your pure functions file. WovenJS will decide where to run the function based on the optimization heuristic. 

  ```javascript
  woven.run('function name', payload, ...moreArgs)
    .then(output => {
      /* do something with output */
    });
  ```
  
  The first argument passed to `woven.run()` is the name of the function as a string. Next you can pass in any arguments that your function will take. You can pass in as many arguments as you like. `woven.run()` always returns a *promise*, so you can chain `.then()` on to `woven.run()` to utilize the output.

</p>

## Contributing
We welcome contributions. If you'd like to contribute, please submit a pull request.

## Authors
<table>
  <tbody>
    <tr>
      <td align="center" valign="top">
        <img width="150" height="150" src="https://user-images.githubusercontent.com/4038732/35314686-afd44822-007c-11e8-8fef-92225d5fb4fa.jpg">
        <br>
        <a href="https://github.com/LazarusCrown">Althea Capra</a>
        <p></p>
        <br>
        <p></p>
      </td>
      <td align="center" valign="top">
        <img width="150" height="150" src="https://user-images.githubusercontent.com/4038732/35314688-affa1d36-007c-11e8-89c2-2492d174b7dc.jpg">
        <br>
        <a href="https://github.com/erikwlarsen">Erik Larsen</a>
        <p></p>
        <br>
        <p></p>
      </td>
      <td align="center" width="20%" valign="top">
        <img width="150" height="150" src="https://user-images.githubusercontent.com/4038732/35314689-b00cfc1c-007c-11e8-97b4-b38651546a12.jpg">
        <br>
        <a href="https://github.com/ryanlondon">Ryan London</a>
        <p></p>
        <br>
        <p></p>
      </td>
      <td align="center" valign="top">
        <img width="150" height="150" src="https://user-images.githubusercontent.com/4038732/35314687-afe7f82c-007c-11e8-9ef2-99ecd3694e3d.jpg">
        <br>
        <a href="https://github.com/warmthesea">Dale Nogiec</a>
        <p></p>
        <br>
        <p></p>
        
     
     
  </tbody>
</table>



## License
This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments
Thanks to Jos Dirksen, whose threadpool inspired our Web Worker pooling setup. Also thanks to the Webpack team for their neato `worker-loader`.
