import { Button } from 'antd';
import 'antd/dist/antd.css';
import React, { useEffect, useRef } from 'react';
import io from 'socket.io-client';


const Grid = (props) => {
    const canvasRef = useRef(null);
    const cursorPos = useRef(null);
    const row = 10;
    const col = 10;

    let updateCanvas = () => {
        let canvas = canvasRef.current;
        let context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.beginPath();
        for (let i = 0; i < row - 1; i++) {
            context.moveTo(0, (i+1)*canvas.height / row);
            context.lineTo(canvas.width, (i+1)*canvas.height / row);
        }
        for (let i = 0; i < col - 1; i++) {
            context.moveTo((i+1)*canvas.width / col, 0);
            context.lineTo((i+1)*canvas.width / col, canvas.height);
        }
        context.stroke();
        if (cursorPos.current != null) {
            let pos = cursorPos.current;
            let xindex = Math.floor(pos.x / canvas.width * col);
            let yindex = Math.floor(pos.y / canvas.height * row);
            context.fillRect(xindex*canvas.width / col, yindex*canvas.height/row, canvas.width/col, canvas.height/row);
        }        
    }

    useEffect(() => {
        updateCanvas();
        canvasRef.current.onmousemove = mouseMove;
        const socket = io(document.domain+':8081');
        socket.on('connect', () => {
            console.log('connected!!');
        });
        socket.on('data', function(data) {
            let lines = data.split('\n');
            lines.forEach(element => {
                let items = element.split(' ');
                if (items.length > 1) {     
                    cursorPos.current = {x: parseFloat(items[1])*canvasRef.current.width, y: parseFloat(items[2])*canvasRef.current.height};
                    updateCanvas();
                }
            });
        });
    })

    useEffect(() => {
        updateCanvas();
    }, [cursorPos]);

    let mouseMove = (e) => {
        let position = windowToCanvas(canvasRef.current, e.clientX, e.clientY);
        cursorPos.current = position;
        updateCanvas();
    }

    let windowToCanvas = (c, x, y) => {
        let rect = c.getBoundingClientRect()
        let xpos = x - rect.left * (c.width / rect.width);
        let ypos = y - rect.top * (c.height/ rect.height);
        return {x: xpos, y: ypos};
    }


    return (
      <div>
        <canvas ref={canvasRef} width="450" height="450" />
        <Button type="primary">test</Button>
      </div>    
    );
}

export default Grid;