class Wall {
    constructor(start, end){
        this.start = start;
        this.end = end;
    }

    draw(){
        stroke(0);
        strokeWeight(2);
        line(this.start.x, this.start.y, this.end.x, this.end.y);
    }
}