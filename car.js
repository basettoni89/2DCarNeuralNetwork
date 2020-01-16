class Car {

    constructor(pos) {
        this.pos = pos;
        this.dir = p5.Vector.fromAngle(-HALF_PI);
        this.speed = 0;
        this.rays = [
            new Ray(this.pos, radians(-135)),
            new Ray(this.pos, radians(-90)),
            new Ray(this.pos, radians(-45))
        ];
        this.distances = [];
    }

    turn(angle) {
        let r = (PI / 10) * angle;
        this.dir.rotate(r);

        for(let ray of this.rays) {
            ray.turn(r);
        }
    }

    update(walls) {
        this.pos.x += this.dir.x * this.speed;
        this.pos.y += this.dir.y * this.speed;

        for (let i = 0; i < this.rays.length; i++) {
            const ray = this.rays[i];
            let closest = null;
            let record = Infinity;
            for (let wall of walls) {
              const pt = ray.cast(wall);
              if (pt) {
                const d = p5.Vector.dist(this.pos, pt);
                if (d < record) {
                  record = d;
                  closest = pt;
                }
              }
            }
            if (closest) {
                this.distances[i] = record;
              stroke(0, 100);
              line(this.pos.x, this.pos.y, closest.x, closest.y);
            }
        }
    }

    draw() {
        push();

        fill(255, 0, 0);
        noStroke();

        translate(this.pos.x, this.pos.y)
        rotate(this.dir.heading() - HALF_PI);

        rectMode(CENTER);
        rect(0, 0, 30, 60);

        pop();
    }
}