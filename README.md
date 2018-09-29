# ctrlb

[![Build Status](https://travis-ci.org/notomo/ctrlb.svg?branch=master)](https://travis-ci.org/notomo/ctrlb)
[![codecov](https://codecov.io/gh/notomo/ctrlb/branch/master/graph/badge.svg)](https://codecov.io/gh/notomo/ctrlb)

ctrlb is a web extension for providing web browser control api through WebSocket.  
**This is in development.**

## Install
- [chrome web store](https://chrome.google.com/webstore/detail/ctrlb/ppeimjidflleifdpgigjikmgmidmmnoh?hl=ja&gl=JP)
- addons.mozilla.org(TODO)

## Usage
1. Set the server host by web extension option.
2. Start a web socket server([wsxhubd](https://github.com/notomo/wsxhub)).
3. Connect by clicking the icon. ![disabled icon](./src/images/icon-19-gray.png) ➡ ![enabled icon](./src/images/icon-19.png)
4. Call api from a ctrlb client.
    - [ctrlb.nvim](https://github.com/notomo/ctrlb.nvim) Neovim ctrlb client plugin
