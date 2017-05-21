import 'whatwg-fetch';

class f {
  ajax({
    method = 'get',
    url,
    data,
    contentType = 'application/json; charset=UTF-8',
    headers = {},
    success,
    error
  }) {
    let req = new XMLHttpRequest();
    req.open(method, url, true);

    if (contentType) {
      req.setRequestHeader('Content-Type', contentType);
    }
    for (let key in headers) {
      req.setRequestHeader(key, headers[key]);
    }

    if (typeof success === 'function' && typeof error === 'function') {
        req.onreadystatechange = () => {
          if (req.readyState == 4) {
            if (req.status == 200) {
              success(req.response);
            } else {
              error(req.statusText);
            }
          }
        };
        req.send(data);
    } else {
      return new Promise((resolve, reject) => {
        req.onreadystatechange = () => {
          if (req.readyState == 4) {
            if (req.status == 200) {
              resolve(req.response);
            } else {
              reject(req.statusText);
            }
          }
        };
        req.send(data);
      });
    }
  }

  //convert js object to query string
  objToQuery(obj) {
    let query = '?';
    Object.keys(obj).forEach((key, index) => {
      if (obj[key] instanceof Object) return;
      if (!obj[key]) return;
      index === 0 ? query += key + '=' + obj[key] : query += '&' + key + '=' + obj[key];
    });

    return query;
  }

  isPositiveInterger(val, canBeNull) {
    if (canBeNull && this.isNull(val)) return true;

    return !isNaN(val) && val > 0 && val == parseInt(val);
  }

  //check if value is null or undefined or ''
  isNull(val) {
    return val == null || val == '';
  }

  debounce(f, delay, context) {
    let timer = null;
    let foo = function() {
      let args = arguments;
      if (args[0].target) args[0].persist();

      clearTimeout(timer);
      timer = setTimeout(() => {
        f.apply(context, args);
      }, delay);
    };
    return foo.bind(this);
  }

  //varify if agents and regions satisfy the constrains of the algorithm
  varify(algorithm, agents, regions, callback) {
    if (agents.length < 1 || regions.length < 1) {
      callback('You should set the environment');
      return false;
    }
    switch (algorithm) {
      case 0: {
        let illegalRegions = [];
        regions.forEach((region) => {
          let agentsInRegion = agents.filter((agent) => {
            return region.some((square) => {
              return square.row === agent.row && square.column === agent.column;
            });
          });
          
          if (agentsInRegion.length > Math.ceil(region.length / 2)) illegalRegions.push(region);
        });

        if (illegalRegions.length > 0) {
          if (illegalRegions.length === 1)
            callback('The number of agents in region ' + illegalRegions[0].id + ' is more than n/2');
          else {
            let regions = illegalRegions.map((region) => {
              return 'region ' + region.id;
            }).join(', ');

            callback('The number of agents in ' + regions + ' are more than n/2');
          }

          return false;
        } else {
          return true;
        }
      }
      case 3: {
        let illegalRegions = [];
        regions.forEach((region) => {
          let agentsInRegion = agents.filter((agent) => {
            return region.some((square) => {
              return square.row === agent.row && square.column === agent.column;
            });
          });
          
          if (agentsInRegion.length > Math.ceil(region.length / 3)) illegalRegions.push(region);
        });

        if (illegalRegions.length > 0) {
          if (illegalRegions.length === 1)
            callback('The number of agents in region ' + illegalRegions[0].id + ' is more than n/3');
          else {
            let regions = illegalRegions.map((region) => {
              return 'region ' + region.id;
            }).join(', ');

            callback('The number of agents in ' + regions + ' are more than n/3');
          }

          return false;
        } else {
          return true;
        }
      }
      case 4: {
        let illegalRegions = [];
        regions.forEach((region) => {
          let agentsInRegion = agents.filter((agent) => {
            return region.some((square) => {
              return square.row === agent.row && square.column === agent.column;
            });
          });
          
          if (agentsInRegion.length > Math.ceil(region.length / 4)) illegalRegions.push(region);
        });
        
        if (illegalRegions.length > 0) {
          if (illegalRegions.length === 1)
            callback('The number of agents in region ' + illegalRegions[0].id + ' is more than n/4');
          else {
            let regions = illegalRegions.map((region) => {
              return 'region ' + region.id;
            }).join(', ');

            callback('The number of agents in ' + regions + ' are more than n/4');
          }

          return false;
        }

        let illegalAgents = [];
        regions.forEach((region) => {
          let agentsInRegion = agents.filter((agent) => {
            return region.some((square) => {
              return square.row === agent.row && square.column === agent.column;
            });
          });

          let endPositions = region.filter((square) => {
            let possibleNextPositions = region.filter((next) => {
              if (next === square) return false;
              return (next.row === square.row && (next.column + 1 === square.column || next.column - 1 === square.column)) || 
                (next.column === square.column && (next.row + 1 === square.row || next.row - 1 === square.row));
            });
            return possibleNextPositions.length < 2;
          });

          let agentsOutOfEndPosition = [];
          //Check if all agents are at end positions
          agentsInRegion.forEach((agent) => {
            let inPosistion =  endPositions.some((endPosition) => {
              return endPosition.row === agent.row && endPosition.column === agent.column;
            });

            if (!inPosistion) agentsOutOfEndPosition.push(agent);

            return inPosistion;
          });
          
          let allAtEndPosition = agentsOutOfEndPosition.length > 0 ? false : true;

          if (endPositions.length < 1) allAtEndPosition = true;

          // let lessThanLimit = agentsInRegion.length <= Math.ceil(region.length / 4);

          // if (!lessThanLimit) {
          //   callback('The number of agents in region should at most be n/4');
          // }
          if (!allAtEndPosition) illegalAgents = illegalAgents.concat(agentsOutOfEndPosition);
        });

        if (illegalAgents.length > 0) {
          if (illegalAgents.length === 1 ) callback(`Agent ${illegalAgents[0].id} is not at the end position`);
          else {
            let agents = illegalAgents.map((agent) => {
              return 'agent ' + agent.id;
            }).join(', ').replace(/a/, 'A');
            callback(agents + ' are not at the end position');
          }
          
          return false;
        }

        return true;
      }
    }
  }

  //check if two squares are joint
  isAdjacent(square1, square2) {
    return (
      square1.row + 1 === square2.row && square1.column === square2.column ||
      square1.row - 1 === square2.row && square1.column === square2.column ||
      square1.row === square2.row && square1.column + 1 === square2.column ||
      square1.row === square2.row && square1.column - 1 === square2.column
    );
  }

  get(agents, id) {
    agents = agents.toArray();
    return agents.filter((agent, index) => {
      if (!agent) return;
      return agent.id == id;
    })[0];
  }

  set(agents, id, value) {
    return agents.map((agent) => {
      if (agent.id == id) return value;
      return agent;
    });
  }
}


const $f = new f();

export {$f};