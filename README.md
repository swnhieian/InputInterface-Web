# A Web-based Input Interface

developed based on [simple-react-full-stack](https://github.com/crsandeep/simple-react-full-stack)

## Introduction
The project consists of 4 components:
+ A gesture keyboard
+ A cursor pad
+ A button pad
+ A morse code input interface (with audio feedback)

## Gesture Keyboard & Cursor Pad
Use mouse (config on the webpage) or send data to `serverip:8081` use socket

Data format:
`type xpos ypos`
+ type == 1 means touchdown
+ type == 2 means touchmove
+ type == 3 means touchup
+ type == 4 means touchmove (between touches)

See `socket-demo.py` as an example.

`xpos` and `xpos` should be **normalized** to a float number in [0,1]
## Button Pad
Use keyboard (arrow keys for selection, space key for click) or send data to `serverip:8081` use socket

Data format:
`cmd`
+ `up`, `left`, `right`, `down` for selection
+ `click` for click

See `socket-demo.py` as an example.

## Morse Code
Use keyboard (`←` for `di`, `→` for `da`, `space` for `space`, `ESC` for `reset`) or send data to `serverip:8081` use socket

Data format:
`cmd`
+ `di`, `da` for input
+ `space` for confirm
+ `reset` for cancel

## Run
```bash
npm install
npm start
```
Webpage runs on `localhost:8000`

## Develop
```bash
npm install
npm run dev
```

## Todo
- [ ] Add log by Debugout.js
