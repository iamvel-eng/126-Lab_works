class Grid {
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.grid = this.initializeGrid();
        this.startNode = null;
        this.endNode = null;
    }

    initializeGrid() {
        const grid = [];
        for (let row = 0; row < this.rows; row++) {
            const currentRow = [];
            for (let col = 0; col < this.cols; col++) {
                currentRow.push(new Node(row, col));
            }
            grid.push(currentRow);
        }
        return grid;
    }

    getNode(row, col) {
        if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
            return this.grid[row][col];
        }
        return null;
    }

    getNeighbors(node) {
        const neighbors = [];
        const { row, col } = node;

        // Get all 4-directional neighbors
        const directions = [
            { dr: -1, dc: 0 }, // Up
            { dr: 1, dc: 0 },  // Down
            { dr: 0, dc: -1 }, // Left
            { dr: 0, dc: 1 }  // Right
        ];

        for (const dir of directions) {
            const neighborRow = row + dir.dr;
            const neighborCol = col + dir.dc;
            const neighbor = this.getNode(neighborRow, neighborCol);
            if (neighbor && !neighbor.isWall) {
                neighbors.push(neighbor);
            }
        }

        return neighbors;
    }

    setStartNode(row, col) {
        // Clear previous start node
        if (this.startNode) {
            this.startNode.isStart = false;
        }

        const node = this.getNode(row, col);
        if (node && !node.isEnd && !node.isWall) {
            node.isStart = true;
            node.distance = 0;
            this.startNode = node;
            return true;
        }
        return false;
    }

    setEndNode(row, col) {
        // Clear previous end node
        if (this.endNode) {
            this.endNode.isEnd = false;
        }

        const node = this.getNode(row, col);
        if (node && !node.isStart && !node.isWall) {
            node.isEnd = true;
            this.endNode = node;
            return true;
        }
        return false;
    }

    toggleWallNode(row, col) {
        const node = this.getNode(row, col);
        if (node && !node.isStart && !node.isEnd) {
            node.isWall = !node.isWall;
            return true;
        }
        return false;
    }

    resetPath() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const node = this.grid[row][col];
                node.reset();
                if (node.isStart) {
                    node.distance = 0;
                }
            }
        }
    }

    clearAll() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const node = this.grid[row][col];
                node.isStart = false;
                node.isEnd = false;
                node.isWall = false;
                node.reset();
            }
        }
        this.startNode = null;
        this.endNode = null;
    }

    clearPath() {
        this.resetPath();
    }

    toggleWeightNode(row, col) {
        const node = this.getNode(row, col);
        if (node && !node.isStart && !node.isEnd && !node.isWall) {
            node.isWeight = !node.isWeight;
            node.weight = node.isWeight ? 5 : 1;
            return true;
        }
        return false;
    }

    // Update clear methods to include weights
    resetPath() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const node = this.grid[row][col];
                node.reset();
                if (node.isStart) {
                    node.distance = 0;
                }
            }
        }
    }

    clearAll() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const node = this.grid[row][col];
                node.isStart = false;
                node.isEnd = false;
                node.isWall = false;
                node.isWeight = false;
                node.weight = 1;
                node.reset();
            }
        }
        this.startNode = null;
        this.endNode = null;
    }
}