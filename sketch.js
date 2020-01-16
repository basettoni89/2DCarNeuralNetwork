const width = 800;
const height = 600;

let car;
let walls = [];

let lastKeyPressedFrame = 0;

let model;

let state = 'idle';

function setup() {
    frameRate(30);
    createCanvas(width, height);

    let options = {
        inputs: ['left', 'center', 'right'],
        outputs: ['move'],
        task: 'classification',
        debug: 'true'
    };
    model = ml5.neuralNetwork(options);
    
    car = new Car(createVector(44, 293));
    walls = [
        new Wall(createVector(7, 51), createVector(70, 10)),
        new Wall(createVector(70, 10), createVector(704, 10)),
        new Wall(createVector(704, 10), createVector(788, 94)),
        new Wall(createVector(788, 94), createVector(787, 521)),
        new Wall(createVector(787, 521), createVector(698, 586)),
        new Wall(createVector(698, 586), createVector(76, 587)),
        new Wall(createVector(76, 587), createVector(8, 525)),
        new Wall(createVector(8, 525), createVector(7, 51)),

        new Wall(createVector(85, 90), createVector(115, 80)),
        new Wall(createVector(115, 80), createVector(665, 80)),
        new Wall(createVector(665, 80), createVector(700, 113)),
        new Wall(createVector(700, 113), createVector(700, 485)),
        new Wall(createVector(700, 485), createVector(683, 508)),
        new Wall(createVector(683, 508), createVector(102, 514)),
        new Wall(createVector(102, 514), createVector(85, 494)),
        new Wall(createVector(85, 494), createVector(85, 90))
    ];
}

function keyPressed() {
    let inputs = null;
    let target = null;

    switch (key) {
        case 'a':
            lastKeyPressedFrame = frameCount;
            inputs = { left: car.distances[0], center: car.distances[1], right: car.distances[2] }
            target = { move: key }
            car.turn(-1);
            break;
        case 'd':
            lastKeyPressedFrame = frameCount;
            inputs = { left: car.distances[0], center: car.distances[1], right: car.distances[2] }
            target = { move: key }
            car.turn(1);
            break;
        case ' ':
            if(state == 'idle') {
                state = 'collection';
                car.speed = 3;                    
            } else if(state == 'prediction') {
                car.speed = 3;
            }
            break;
        case 't':
            state = 'training';
            model.normalizeData();
            let options = {
                epochs: 200
            };
            model.train(options, whileTraining, finishedTraining);
            break;
        case 's':
            model.saveData('run');
            break;
        case 'l':
            model.loadData('run.json', dataLoaded);
            break;
    }
    if(inputs != null && target != null) {
        model.addData(inputs, target);      
    }
}

function whileTraining(epoch, loss) {
    console.log(epoch);
}
  
function finishedTraining() {
    console.log('finished training.');
    state = 'prediction';
}

function dataLoaded() {
    console.log(model.data);
    state = 'training';
    console.log('starting training');
    model.normalizeData();
    let options = {
        epochs: 200
    };
    model.train(options, whileTraining, finishedTraining);
}

function mousePressed() {
    console.log(mouseX + ", " + mouseY)
}

function draw() {
    background(255);

    if(state == 'collection' && (frameCount - lastKeyPressedFrame) % 30 == 0) {
        let inputs = { left: car.distances[0], center: car.distances[1], right: car.distances[2] }
        let target = { move: ' ' }
        model.addData(inputs, target);
    }

    if(state == 'prediction' && (frameCount - lastKeyPressedFrame) % 10 == 0) {
        let inputs = { left: car.distances[0], center: car.distances[1], right: car.distances[2] }
        model.classify(inputs, onClassify)
    }
    
    car.update(walls);
    car.draw();

    for(let wall of walls) {
        wall.draw();
    }
}

function onClassify(error, results){
    if (error) {
        console.error(error);
        return;
    }
    console.log(results);
    switch(results[0].label){
        case 'a':
            car.turn(-1);
            break;
        case 'd':
            car.turn(1);
            break;
    }
}