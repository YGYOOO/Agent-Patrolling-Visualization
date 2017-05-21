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
        this.historyTargetLists = new Object();
        this.targets = new Object();
        this.agents = [];
        this.steps = 0;
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

        let agent = new Object();
        agent.aid = ID;
        agent.visitedNodes = 1;
        this.agents.push(agent);

        this.targets[ID] = [];

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
            this.historyTargetLists[key] = [];
        }
    }


    getATargetFromTargetList(agentID, currentPosition) {
        let regionID = this.agentMapRegion[agentID];
        let maxDistance = 0;
        let target;
        this.targetLists[regionID].forEach((position) => {
            let distance = this.manhattanDistance(currentPosition, position);
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
            this.steps++;
            for (var regionID in this.targetLists) {
                this.historyTargetLists[regionID].push(this.targetLists[regionID]);
            }
            // positions need to be removed from the taregt list
            let positions = [];

            for (var agentID in this.traces) {
                let shortestPath = this.shortestPaths[agentID];

                if (shortestPath.length != 0) {
                    let target = shortestPath[shortestPath.length - 1];
                    let nextPosition = shortestPath.shift();
                    this.markVisited(nextPosition);
                    this.traces[agentID].push(nextPosition);
                    this.targets[agentID].push(target);
                    this.removeFromTargetList(agentID, nextPosition);
                } else {
                
                    let trace = this.traces[agentID];
                    let currentPosition = trace[trace.length - 1];
                    let target = this.getATargetFromTargetList(agentID, currentPosition);
                    if (!target) {
                        continue;
                    }
                    let grid = new PF.Grid(this.matrix); 
                    let finder = new PF.AStarFinder();
                    let path = finder.findPath(currentPosition.column, currentPosition.row,
                                                target.column, target.row, grid);
                    
                    //take the next point and move to it
                    let nextPosition = new Object();
                    nextPosition.row = path[1][1];
                    nextPosition.column = path[1][0];
                    this.markVisited(nextPosition);
                    trace.push(nextPosition);
                    this.targets[agentID].push(target);
                    //this.removeFromTargetList(agentID, nextPosition);
                    nextPosition.agentID = agentID;
                    positions.push(nextPosition);

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
            for (var i = 0; i < positions.length; i++) {
                this.removeFromTargetList(positions[i].agentID, positions[i]);
            }
        }    
        let map = new Map();
        Object.keys(this.traces).forEach(key => {
            map.set(key, this.traces[key]);
        }); 
        this.traces = map;
    }

//=============================================== algorithm 3 ================================
    getAFarestTarget(agentID, currentPosition) {
        let regionID = this.agentMapRegion[agentID];
        let maxDistance = 0;
        let target;
        this.targetLists[regionID].forEach((position) => {
            let grid = new PF.Grid(this.matrix); 
            let finder = new PF.AStarFinder();
            let path = finder.findPath(currentPosition.column, currentPosition.row,
                                        position.column, position.row, grid);
            let distance = path.length;
            if (distance > maxDistance) {
                target = position;
                maxDistance = distance;
            }
        });
        return target;
    }

    move3() {
        while (!this.isComplete() || !this.allAgentArriveTarget()) {
            this.steps++;
            for (var regionID in this.targetLists) {
                this.historyTargetLists[regionID].push(this.targetLists[regionID]);
            }
            //the positions need to be removed from target list
            let positions = [];
            for (var agentID in this.traces) {
                let shortestPath = this.shortestPaths[agentID];

                if (shortestPath.length != 0) {
                    let target = shortestPath[shortestPath.length - 1];
                    let nextPosition = shortestPath.shift();
                    this.markVisited(nextPosition);
                    this.traces[agentID].push(nextPosition);
                    this.targets[agentID].push(target);
                    this.removeFromTargetList(agentID, nextPosition);
                } else {
                
                    let trace = this.traces[agentID];
                    let currentPosition = trace[trace.length - 1];
                    let target = this.getAFarestTarget(agentID, currentPosition);
                    if (!target) {
                        continue;
                    }
                    let grid = new PF.Grid(this.matrix); 
                    let finder = new PF.AStarFinder();
                    let path = finder.findPath(currentPosition.column, currentPosition.row,
                                                target.column, target.row, grid);
                    
                    //take the next point and move to it
                    let nextPosition = new Object();
                    nextPosition.row = path[1][1];
                    nextPosition.column = path[1][0];
                    this.markVisited(nextPosition);
                    trace.push(nextPosition);
                    this.targets[agentID].push(target);
                    // this.removeFromTargetList(agentID, nextPosition);
                    //this.removeFromTargetList(agentID, target);
                    nextPosition.agentID = agentID;
                    positions.push(nextPosition);
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
            for (var i = 0; i < positions.length; i++) {
                this.removeFromTargetList(positions[i].agentID, positions[i]);
            }
        }    
        let map = new Map();
        Object.keys(this.traces).forEach(key => {
            map.set(key, this.traces[key]);
        }); 
        this.traces = map;
    }

//======================================== algorithm 4 ========================================
    getTheFirstOfTargetList(agentID, currentPosition) {
        let regionID = this.agentMapRegion[agentID];
        return this.targetLists[regionID][0];
    }
    
    move4() {
        while (!this.isComplete() || !this.allAgentArriveTarget()) {
            this.steps++;
            for (var regionID in this.targetLists) {
                this.historyTargetLists[regionID].push(this.targetLists[regionID]);
            }

            let positions = [];
            //update the visited nodes of each agent
            for (var agentID in this.traces) {
                let trace = this.traces[agentID];
                let temp = [];

                for (var i = 0; i < trace.length; i++) {
                    let position = trace[i];
                    let isNewNode = true;
                    for (var j = 0; j < temp.length; j++) {
                        let node = temp[j];
                        if (node.column === position.column && node.row === position.row) {
                            isNewNode = false;
                        } 
                    }
                    if (isNewNode) {
                        temp.push(position);
                    }
                }
                for (let j = 0; j < this.agents.length; j++) {
                    if (this.agents[j].aid == agentID) {
                        this.agents[j].visitedNodes = temp.length;
                        break;
                    }
                } 
            }

            //store the agents who need to select target at the same time
            let tempAgents = [];

            let notChoosetargetAgents = [];

            for (var agentID in this.traces) {
                let shortestPath = this.shortestPaths[agentID];

                if (shortestPath.length != 0) {
                    notChoosetargetAgents.push(agentID);
                } else {
                    for (var i = 0; i < this.agents.length; i++) {
                        let agent = this.agents[i];
                        if (agent.aid == agentID) {
                            tempAgents.push(agent);
                        }
                    }
                }
            }

            tempAgents.sort(function (a, b) {
                return a.visitedNodes - b.visitedNodes;
            });

            for (var j = 0; j < tempAgents.length; j++) {
                let agent = tempAgents[j];
                let agentID = agent.aid;

                let shortestPath = this.shortestPaths[agentID];
                let trace = this.traces[agentID];
                let currentPosition = trace[trace.length - 1];
                let target = this.getTheFirstOfTargetList(agentID, currentPosition);
                if (!target) {
                    continue;
                }
                let grid = new PF.Grid(this.matrix); 
                let finder = new PF.AStarFinder();
                let path = finder.findPath(currentPosition.column, currentPosition.row,
                                            target.column, target.row, grid);
                
                //take the next point and move to it
                let nextPosition = new Object();
                nextPosition.row = path[1][1];
                nextPosition.column = path[1][0];
                this.markVisited(nextPosition);
                trace.push(nextPosition);
                this.targets[agentID].push(target);
                
                nextPosition.agentID = agentID;
                positions.push(nextPosition);
                //this.removeFromTargetList(agentID, nextPosition);
                //this.removeFromTargetList(agentID, target);
                //store the path into shortestPath
                let i;
                for (i = 2; i < path.length; i++) {
                    let position = new Object();
                    position['column'] = path[i][0];
                    position['row'] = path[i][1];
                    shortestPath.push(position);
                }
            }
            for (var i = 0; i < positions.length; i++) {
                this.removeFromTargetList(positions[i].agentID, positions[i]);
            }
            for (let i = 0; i < notChoosetargetAgents.length; i++) {
                let aid = notChoosetargetAgents[i];
                let shortestPath = this.shortestPaths[aid];
                let target = shortestPath[shortestPath.length - 1];
                    
                let nextPosition = shortestPath.shift();
                this.markVisited(nextPosition);
                this.traces[aid].push(nextPosition);
                this.targets[aid].push(target);
                this.removeFromTargetList(aid, nextPosition);
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


