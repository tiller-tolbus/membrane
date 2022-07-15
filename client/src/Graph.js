export default function Graph() {
  this.adjList = {};
}

Graph.prototype.addVertex = function (vertex) {
  this.adjList[vertex] = [];
};

Graph.prototype.addEdge = function (vertex1, vertex2) {
  this.adjList[vertex1].push(vertex2);
};

Graph.prototype.dfs = function () {
  const nodes = Object.keys(this.adjList);
  const visited = {};
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    this._dfsUtil(node, visited);
  }
};

Graph.prototype._dfsUtil = function (vertex, visited) {
  if (!visited[vertex]) {
    visited[vertex] = true;
    console.log(vertex, visited);
    const neighbors = this.adjList[vertex];
    for (let i = 0; i < neighbors.length; i++) {
      const neighbor = neighbors[i];
      this._dfsUtil(neighbor, visited);
    }
  }
};

Graph.prototype.detectCycle = function () {
  const graphNodes = Object.keys(this.adjList);
  const visited = {};
  const recStack = {};

  for (let i = 0; i < graphNodes.length; i++) {
    const node = graphNodes[i];
    if (this._detectCycleUtil(node, visited, recStack))
      return "there is a cycle";
  }
  return "no cycle!";
};

Graph.prototype._detectCycleUtil = function (vertex, visited, recStack) {
  if (!visited[vertex]) {
    visited[vertex] = true;
    recStack[vertex] = true;
    const nodeNeighbors = this.adjList[vertex];
    for (let i = 0; i < nodeNeighbors.length; i++) {
      const currentNode = nodeNeighbors[i];
      //console.log("parent", vertex, "Child", currentNode);
      if (
        !visited[currentNode] &&
        this._detectCycleUtil(currentNode, visited, recStack)
      ) {
        return true;
      } else if (recStack[currentNode]) {
        return true;
      }
    }
  }
  recStack[vertex] = false;
  return false;
};
Graph.prototype.printGraphe = function () {
  console.log(this.adjList);
};