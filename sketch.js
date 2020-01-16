const width = 800;
const height = 600;

let car;
let walls = [];

let lastKeyPressedFrame = 0;

let model;

let state = 'idle';

function preload() {
    loadJSON('track.json', onLoadJSONCompleted);
}

function onLoadJSONCompleted(json) {
    for(let w of json.walls) {
        walls.push(new Wall(w.ax, w.ay, w.bx, w.by));
    }
    car = new Car(createVector(json.car.x, json.car.y));
}

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

function draw() {
    background(255);

    if(state == 'collection' && (frameCount - lastKeyPressedFrame) % 30 == 0) {
        let inputs = { left: car.distances[0], center: car.distances[1], right: car.distances[2] }
        let target = { move: ' ' }
        model.addData(inputs, target);
    }

    if(state == 'prediction' && frameCount % 5 == 0) {
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
    switch(results[0].label){
        case 'a':
            car.turn(-1);
            break;
        case 'd':
            car.turn(1);
            break;
    }
}