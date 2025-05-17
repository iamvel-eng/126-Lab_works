class Node {
    constructor(row, col) {
        this.row = row;
        this.col = col;
        this.isStart = false;
        this.isEnd = false;
        this.isWall = false;
        this.isVisited = false;
        this.isPath = false;
        this.previousNode = null;
        this.distance = Infinity;
        this.heuristic = Infinity;
        this.totalCost = Infinity;
        this.weight = 1;
    }

    reset() {
        this.isVisited = false;
        this.isPath = false;
        this.previousNode = null;
        this.distance = Infinity;
        this.heuristic = Infinity;
        this.totalCost = Infinity;
    }
}