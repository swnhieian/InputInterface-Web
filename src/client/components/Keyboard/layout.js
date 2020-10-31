export default class Layout { // QWERTY layout
    pos;
    keyWidth;
    keyHeight;
    constructor(para) {
        this.pos = new Map();
        this.keyWidth = para.width / 10;
        this.keyHeight = para.height / 3;
        let line = 'qwertyuiop';
        for (let i = 0; i < line.length; i++) {
            this.pos.set(line[i], {x: para.posx + (i + 0.5)*this.keyWidth, y: para.posy + this.keyHeight * 0.5});
        }
        line = 'asdfghjkl';
        for (let i = 0; i < line.length; i++) {
            this.pos.set(line[i], {x: para.posx + (i + 1)*this.keyWidth, y: para.posy + this.keyHeight * 1.5});
        }
        line = 'zxcvbnm';
        for (let i = 0; i < line.length; i++) {
            this.pos.set(line[i], {x: para.posx + (i + 2)*this.keyWidth, y: para.posy + this.keyHeight * 2.5});
        }
        console.log(this.pos);
    }
    render(context) {
        console.log("in render");
        console.log(this.pos);
        console.log(this.pos.keys());
        context.textAlign = 'center';
        this.pos.forEach((value, key) => {
            context.strokeRect(value.x - this.keyWidth/2, value.y - this.keyHeight/2, this.keyWidth, this.keyHeight);
            context.strokeText(key.toUpperCase(), value.x, value.y);
        })
    }
    getCenter(char) {
        return this.pos.get(char);
    }
}