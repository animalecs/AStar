function removeFromArray(arr, elt) {
    // going backwords because otherwise the array would move and the for loop
    // would go out-of-index
    for (let i = arr.length-1; i >= 0; i--) {
        if(arr[i] == elt) {
            arr.splice(i, 1);
        }
    }
}

function heuristic(a, b) {
    // euclidian distance between two points
    let d = dist(a.i, a.j, b.i, b.j);

    // difference between x and y of the two points
    //let d = abs(a.i - b.i) + abs(a.j - b.j);
    return d;
}

var rows = 50;
var cols = 50;
var grid = new Array(cols);

// final path from the start to the end
var finalPath = [];
// list of nodes yet to be processed
var openSet = [];
// list of already processed nodes
var closedSet = [];
// start node
var start;
// end node
var end;
// width and heigth of the rendered node
var w, h;

function Spot(i, j) {

    this.i = i;
    this.j = j;
    //g + h
    this.f = 0;
    // time to get from the start to here
    this.g = 0;
    // estimate of time to get ot the end
    this.h = 0;
    this.neighbours = [];
    this.previous = undefined;
    // if wall is true this node is an obstacle
    this.wall = false;

    // if random number is less than a treshold make this node an obstacle
    if(random(1) < 0.4) {
        this.wall = true;
    }

    this.show = function(color) {
        fill(color);
        // the wall is always black
        if(this.wall)
            fill(0);
        noStroke();
        rect(this.i*w, this.j*h, w - 1, h - 1);
    };

    this.addNeighbours = function(grid) {
        // add the neighbours of this node
        if(this.i < cols - 1)
            this.neighbours.push(grid[this.i + 1][this.j]);
        if(this.i > 0)
            this.neighbours.push(grid[this.i - 1][this.j]);
        if(this.j < rows - 1)
            this.neighbours.push(grid[this.i][this.j + 1]);
        if(this.j > 0)
            this.neighbours.push(grid[this.i][this.j - 1]);
        if(this.i > 0 && this.j > 0)
            this.neighbours.push(grid[this.i - 1][this.j - 1]);
        if(this.i < cols - 1 && this.j > 0)
            this.neighbours.push(grid[this.i + 1][this.j - 1]);
        if(this.i > 0 && this.j < rows - 1)
            this.neighbours.push(grid[this.i - 1][this.j + 1]);
        if(this.i < cols - 1 && this.j < rows - 1)
            this.neighbours.push(grid[this.i + 1][this.j + 1]);
    }
}

function setup() {
    createCanvas(400, 400);

    h = width / rows;
    w = width / cols;

    // setup grid
    for(let i=0; i < cols; i++) {
        grid[i] = new Array(rows);
        for(let j=0; j<rows; j++) {
            grid[i][j] = new Spot(i, j);
        }
    }

    // add neighbours to each node
    for(let i=0; i < cols; i++) {
        for(let j=0; j < rows; j++) {
            grid[i][j].addNeighbours(grid);
        }
    }

    console.log(grid);

    start = grid[0][0];
    end = grid[cols-1][rows-1];
    // start and end can never be a wall
    start.wall = false;
    end.wall = false;
    // first node that has to be evaluated
    openSet.push(start);
}
  
function draw() {

    // if there's something to be evaluated
    if(openSet.length > 0) {
        // look for the f with the lowest f
        let winner = 0;
        for(let i = 0; i < openSet.length; i++) {
            if(openSet[i].f < openSet[winner].f) {
                winner = i;
            }
        }
        var current = openSet[winner];
        // if we found the end node we're done
        if(current === end) {
            console.log("DONE");
            noLoop();
        }

        removeFromArray(openSet, current);
        closedSet.push(current);

        let neighbours = current.neighbours;
        for (let i = 0; i < neighbours.length; i++) {
            let neighbour = neighbours[i];
            // if we've not evaluated the neighbour yet
            if(!closedSet.includes(neighbour) && !neighbour.wall) {
                // temp updated to get to the neighbour
                let tempG = current.g + 1;
                // this variable is true just when i found a new and better path
                let newPath = false;
                // is it something i've elaborated before
                if(openSet.includes(neighbour)) {
                    // if this g is better update it
                    if(tempG < neighbour.g) {
                        neighbour.g = tempG;
                        newPath = true;
                    }
                } else {
                    neighbour.g = tempG;
                    // add to the elaborated nodes
                    openSet.push(neighbour);
                    newPath = true;
                }

                if(newPath) {
                    neighbour.h = heuristic(neighbour, end);
                    neighbour.f = neighbour.g + neighbour.h;
                    neighbour.previous = current;
                }

            }

        }
        
    } else {
        console.log("No solution");
        noSolution = true;
        noLoop();
    }

    background(0);

    // render white grid
    for(let i=0; i < cols; i++)
        for(let j=0; j<rows; j++)
            grid[i][j].show(color(255));

    // render finished nodes
    for(let i=0; i < closedSet.length; i++) {
        closedSet[i].show(color(255, 0, 0));
    }


    // render nodes to be evalauted
    for(let i=0; i < openSet.length; i++) {
        // green
        openSet[i].show(color(0, 255, 0));
    }

    
    // find the best path
    finalPath = [];
    finalPath.push(current);
    while(current && current.previous) {
        finalPath.push(current.previous);
        current = current.previous;
    }
    

    // render best path
    for(let i = 0; i < finalPath.length; i++) {
        if(finalPath[i])
            finalPath[i].show(color(0, 0, 255));
    }
}