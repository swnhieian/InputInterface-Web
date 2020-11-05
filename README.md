# A Web-based Input Interface

developed based on [simple-react-full-stack](https://github.com/crsandeep/simple-react-full-stack)

## Introduction
The project consists of two components:
+ A gesture keyboard
+ A cursor pad

Use mouse (config on the webpage) or send data to `serverip:8081` use socket

Data format:
`type xpos ypos`
+ type == 1 means touchdown
+ type == 2 means touchmove
+ type == 3 means touchup
+ type == 4 means touchmove (between touches)

`xpos` and `xpos` should be **normalized** to a float number in [0,1]

See `socket-demo.py` as an example.

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
