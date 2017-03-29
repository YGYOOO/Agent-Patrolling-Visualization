import PF from 'pathfinding';

class RunningEnvironment{
    constructor() {
        this.block = [];
        this.visited = [];
        this.matrix = [];
        this.traces = new Object();
        this.regions = new Object();
        this.targetLists = new Object();
        this.agentMapRegion = new Object();
        this.shortestPaths = new Object();
    }

    //init the environment with blockMatrix
    initBlock(blockMatrix) {
        const len = blockMatrix.length;
        const width = blockMatrix[0].length;

        let i, j;
        for (i = 0; i < len; i++) {
            this.block[i] = [];
            this.visited[i] = [];
            this.matrix[i] = [];
            for (j = 0; j < width; j++) {
                this.block[i][j] = blockMatrix[i][j];
                if (blockMatrix[i][j] === -1) {
                    this.visited[i][j] = -1;
                    this.matrix[i][j] = 1;
                } else {
                    this.visited[i][j] = 0;
                    this.matrix[i][j] = 0;
                }
            }
        }
    }

    //add an agent in a region
    addAgent(ID, initialPosition) {
        this.bindAgentWithRegion(ID, initialPosition);
        let positions = [];
        positions.push(initialPosition);
        this.traces[ID] = positions;

        let shortestPath = [];
        this.shortestPaths[ID] = shortestPath;

        this.visited[initialPosition['row']][initialPosition['column']]++;
        //remove from target lists
        this.removeFromTargetList(ID, initialPosition);
    }

    //remove a position that the agent whose ID is agentID 
    //visited from the region's target list
    removeFromTargetList(agentID, position) {
        let regionID = this.agentMapRegion[agentID];

        this.targetLists[regionID] = this.targetLists[regionID].filter((coordinate) => {
                return coordinate.row != position.row || coordinate.column != position.column;
            }   
        );
    }

    //bind a agent with the region where the agent locate in
    bindAgentWithRegion(agentID, initialPosition) {
        let regionID;
        for (let key in this.regions) {
            let i = 0;
            for (i = 0; i < this.regions[key].length; i++) {
                if (this.regions[key][i].row === initialPosition.row &&
                 this.regions[key][i].column === initialPosition.column) {
                    regionID = key;
                 }
            }
        
        }
            
        this.agentMapRegion[agentID] = regionID;
    }

    //add a region, this function should be invoked before addAgent
    addRegions(regions) {
        for (let key in regions) {
            this.regions[key] = regions[key];
            this.targetLists[key] = regions[key];
        }
    }


    getATargetFromTargetList(agentID, currentPosition) {
        let regionID = this.agentMapRegion[agentID];
        let maxDistance = 0;
        let target;
        this.targetLists[regionID].forEach((position) => {
            let distance = this.manhattanDistance(currentPosition, position)
            if (distance > maxDistance) {
                target = position;
                maxDistance = distance;
            }
        });
        return target;
    }

    manhattanDistance(position1, position2) {
        return Math.abs(position1.row - position2.row) + 
               Math.abs(position1.column - position2.column);
    }

    markVisited(position) {
        this.visited[position.row][position.column]++;
    }

    move() {
        while (!this.isComplete() || !this.allAgentArriveTarget()) {
            for (var agentID in this.traces) {
                let shortestPath = this.shortestPaths[agentID];

                if (shortestPath.length != 0) {
                    let nextPosition = shortestPath.shift();
                    this.markVisited(nextPosition);
                    this.traces[agentID].push(nextPosition);
                    this.removeFromTargetList(agentID, nextPosition);
                } else {
                
                    let trace = this.traces[agentID];
                    let currentPosistion = trace[trace.length - 1];
                    let target = this.getATargetFromTargetList(agentID, currentPosistion);
                    if (!target) {
                        continue;
                    }
                    let grid = new PF.Grid(this.matrix); 
                    let finder = new PF.AStarFinder();
                    let path = finder.findPath(currentPosistion.column, currentPosistion.row,
                                                target.column, target.row, grid);
                    
                    //take the next point and move to it
                    let nextPosition = new Object();
                    nextPosition.row = path[1][1];
                    nextPosition.column = path[1][0];
                    this.markVisited(nextPosition);
                    trace.push(nextPosition);
                    this.removeFromTargetList(agentID, nextPosition);
                    this.removeFromTargetList(agentID, target);
                    //store the path into shortestPath
                    let i;
                    for (i = 2; i < path.length; i++) {
                        let position = new Object();
                        position['column'] = path[i][0];
                        position['row'] = path[i][1];
                        shortestPath.push(position);
                    }
                }
            }
        }    
        let map = new Map();
        Object.keys(this.traces).forEach(key => {
            map.set(key, this.traces[key]);
        }); 
        this.traces = map;
    }

    allAgentArriveTarget() {
        for (var agentID in this.traces) {
            let shortestPath = this.shortestPaths[agentID];
            if (shortestPath.length > 0) return false; 
        }
        return true;
    }

    //find unvisited neighbour in the order of right->up->left->down
    findANeighbour(row, column) {
        const len = this.visited.length;
        const width = this.visited[0].length;

        if (row >= len || row < 0 || column < 0 || column >= width) return null;

        let neighbour = {};

        if (column + 1 < width && this.visited[row][column + 1] === 0) {
            neighbour['row'] = row;
            neighbour['column'] = column + 1;
            return neighbour; 
        }

        if (row - 1 >= 0 && this.visited[row - 1][column] === 0) {
            neighbour['row'] = row - 1;
            neighbour['column'] = column;
            return neighbour;
        }

        if (column - 1 >= 0 && this.visited[row][column - 1] === 0) {
            neighbour['row'] = row;
            neighbour['column'] = column - 1;
            return neighbour;
        }

        if (row + 1 < len && this.visited[row + 1][column] === 0) {
            neighbour['row'] = row + 1;
            neighbour['column'] = column;
            return neighbour;
        }
    }

    // if the every open space is visited, return 1, otherwise return 0;
    isComplete() {
        let r = 1;

        const len = this.visited.length;
        const width = this.visited[0].length;

        let i = 0;
        let j = 0;
        
        for (i = 0; i < len; i++) {
            for (j = 0; j < width; j++) {
                if (this.visited[i][j] === 0) {
                    r = 0;
                    return r;
                }
            }
        }
        return r;
    }
}

// const algorithm = RunningEnvironment;
export {RunningEnvironment};


