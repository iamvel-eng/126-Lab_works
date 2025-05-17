
class Pathfinder {
    constructor(grid) {
        this.grid = grid;
        this.visitedNodesInOrder = [];
        this.pathNodesInOrder = [];
        this.isVisualizing = false;
        this.speed = 5;
        this.visitedCount = 0;
        this.pathLength = 0;
        this.timeElapsed = 0;
    }
    
    setSpeed(speed) {
        this.speed = speed;
    }

    async visualizePathfinding() {
        if (this.isVisualizing) return;

        // Add ignition effect to start node
        const startCell = document.getElementById(`cell-${this.grid.startNode.row}-${this.grid.startNode.col}`);
        startCell.classList.add('active');

        
        this.isVisualizing = true;
        this.visitedCount = 0;
        this.pathLength = 0;
        this.timeElapsed = 0;
        
        // Reset previous path and visited nodes
        this.grid.resetPath();
        this.visitedNodesInOrder = [];
        this.pathNodesInOrder = [];
        
        updateStats(0, 0, 0);
        showMessage("Finding path...");
        
        const startTime = performance.now();
        
        // Choose algorithm based on selection
        const algorithm = document.getElementById('algorithm-select').value;
        let success = false;
        
        if (algorithm === 'dijkstra') {
            success = await this.dijkstra();
        } else if (algorithm === 'astar') {
            success = await this.aStar();
        // } else if (algorithm === 'greedy') {
        //     success = await this.greedyBestFirst();
        }
        
        if (success) {
            await this.visualizePath();
            showMessage("Path found! 🎉");
        } else {
            showMessage("No path exists! 💔");
        }
        
        this.timeElapsed = performance.now() - startTime;
        updateStats(this.visitedCount, this.pathLength, this.timeElapsed);
        
        this.isVisualizing = false;
    }

    /* Dijkstar Algorithm */
    async dijkstra() {
        if (!this.grid.startNode || !this.grid.endNode) {
            alert('Please set both start and end nodes');
            this.isVisualizing = false;
            return false;
        }

        const unvisitedNodes = [];
        for (let row = 0; row < this.grid.rows; row++) {
            for (let col = 0; col < this.grid.cols; col++) {
                unvisitedNodes.push(this.grid.grid[row][col]);
            }
        }

        while (unvisitedNodes.length > 0) {
            // Sort nodes by distance
            unvisitedNodes.sort((a, b) => a.distance - b.distance);
            const closestNode = unvisitedNodes.shift();

            // Skip walls
            if (closestNode.isWall) continue;

            // If the closest node is at infinity, we're trapped
            if (closestNode.distance === Infinity) {
                alert('No path found!');
                return false;
            }

            closestNode.isVisited = true;
            this.visitedNodesInOrder.push(closestNode);
            this.visitedCount++;

            // Visualize visited node
            await this.visualizeVisited(closestNode);

            // If we reached the end node
            if (closestNode === this.grid.endNode) {
                return true;
            }

            // Update neighbors
            const neighbors = this.grid.getNeighbors(closestNode);
            for (const neighbor of neighbors) {
                const newDistance = closestNode.distance + neighbor.weight;
                if (newDistance < neighbor.distance) {
                    neighbor.distance = newDistance;
                    neighbor.previousNode = closestNode;
                }
            }
        }

        alert('No path found!');
        return false;
    }
    
    /* AStar Algorithm */
    async aStar() {
        if (!this.grid.startNode || !this.grid.endNode) {
            alert('Please set both start and end nodes');
            this.isVisualizing = false;
            return false;
        }

        const openSet = [this.grid.startNode];
        const closedSet = [];
        
        // Initialize heuristics
        for (let row = 0; row < this.grid.rows; row++) {
            for (let col = 0; col < this.grid.cols; col++) {
                const node = this.grid.grid[row][col];
                node.heuristic = this.calculateHeuristic(node, this.grid.endNode);
                node.totalCost = Infinity;
            }
        }
        
        this.grid.startNode.totalCost = this.grid.startNode.heuristic;

        while (openSet.length > 0) {
            // Sort nodes by total cost (f = g + h)
            openSet.sort((a, b) => a.totalCost - b.totalCost);
            const currentNode = openSet.shift();

            // Skip walls
            if (currentNode.isWall) continue;

            currentNode.isVisited = true;
            this.visitedNodesInOrder.push(currentNode);
            this.visitedCount++;

            // Visualize visited node
            await this.visualizeVisited(currentNode);

            // If we reached the end node
            if (currentNode === this.grid.endNode) {
                return true;
            }

            closedSet.push(currentNode);

            // Update neighbors
            const neighbors = this.grid.getNeighbors(currentNode);
            for (const neighbor of neighbors) {
                if (closedSet.includes(neighbor)) continue;

                const tentativeDistance = currentNode.distance + neighbor.weight;
                
                if (!openSet.includes(neighbor)) {
                    openSet.push(neighbor);
                } else if (tentativeDistance >= neighbor.distance) {
                    continue;
                }

                neighbor.previousNode = currentNode;
                neighbor.distance = tentativeDistance;
                neighbor.totalCost = neighbor.distance + neighbor.heuristic;
            }
        }

        alert('No path found!');
        return false;
    }

    calculateHeuristic(node, endNode) {
        // Manhattan distance
        return Math.abs(node.row - endNode.row) + Math.abs(node.col - endNode.col);
    }

    // filepath: c:\Users\JovelCabz\Desktop\Pathfinding Visualizer\js\core\Pathfinder.js
    async visualizeVisited(node) {
        const cell = document.getElementById(`cell-${node.row}-${node.col}`);
        cell.classList.remove('visited'); // Remove if already present
        void cell.offsetWidth; // Force reflow
        cell.classList.add('visited');
        
        // Adjust visualization speed
        const delay = 100 - (this.speed * 10); // Range from 10ms to 90ms
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    async visualizePath() {
        // Backtrack from end node to start node
        let currentNode = this.grid.endNode.previousNode;
        while (currentNode && currentNode !== this.grid.startNode) {
            this.pathNodesInOrder.unshift(currentNode);
            currentNode = currentNode.previousNode;
        }
        

        this.pathLength = this.pathNodesInOrder.length + 1; // +1 for end node

        // Visualize path
        for (const node of this.pathNodesInOrder) {
            node.isPath = true;
            const cell = document.getElementById(`cell-${node.row}-${node.col}`);
            cell.classList.add('path');
            
            // Adjust visualization speed
            const delay = 100 - (this.speed * 10);
            await new Promise(resolve => setTimeout(resolve, delay));
        }

        // Highlight end node again
        const endCell = document.getElementById(`cell-${this.grid.endNode.row}-${this.grid.endNode.col}`);
        endCell.classList.add('path');
        endCell.style.animation = 'ignite 0.5s ease-out';
    }
}



// Game helper functions
function updateStats(visitedCount, pathLength, timeElapsed) {
    document.getElementById('visited-count').textContent = visitedCount;
    document.getElementById('path-length').textContent = pathLength;
    document.getElementById('time-elapsed').textContent = timeElapsed.toFixed(0) + "ms";
}

function showMessage(message) {
    const messageElement = document.getElementById('game-message');
    messageElement.textContent = message;
    messageElement.style.animation = 'none';
    void messageElement.offsetWidth; // Trigger reflow
    messageElement.style.animation = 'fadeIn 0.5s';
}

/* Removed duplicate or misplaced setupWizardCursor definition.
   The correct setupWizardCursor method is already defined as a class method inside Pathfinder.
   If you need a standalone function, remove 'this.' references or move this code inside the class. */

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const rows = 10;
    const cols = 10;
    const grid = new Grid(rows, cols);
    const pathfinder = new Pathfinder(grid);
    const uiController = new UIController(grid, pathfinder);
    
    // Set default speed
    pathfinder.setSpeed(5);
    
    // Add some fun styling
    document.documentElement.style.setProperty('--pixel-border', '2px solid #000');
    
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(style);
});

function updateStats(visitedCount, pathLength, timeElapsed) {
    document.getElementById('visited-count').textContent = visitedCount;
    document.getElementById('path-length').textContent = pathLength;
    document.getElementById('time-elapsed').textContent = timeElapsed.toFixed(2);
}


// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const rows = 10;
    const cols = 10;
    const grid = new Grid(rows, cols);
    const pathfinder = new Pathfinder(grid);
    const uiController = new UIController(grid, pathfinder);
    
    // Set default speed
    pathfinder.setSpeed(5);
});