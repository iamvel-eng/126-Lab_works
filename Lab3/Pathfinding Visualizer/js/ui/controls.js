// UI Controller
class UIController {
       constructor(grid, pathfinder) {
        this.grid = grid;
        this.pathfinder = pathfinder;
        this.currentTool = 'start';
        this.isMouseDown = false;
        this.dragType = null;
        this.initializeUI();
        this.setupEventListeners();

        this.soundEnabled = true;
        this.setupSoundToggle();

         // Initialize grid size inputs
        document.getElementById('rows-input').value = grid.rows;
        document.getElementById('cols-input').value = grid.cols;
    }

    // Add resize grid method
    resizeGrid() {
        const newRows = parseInt(document.getElementById('rows-input').value);
        const newCols = parseInt(document.getElementById('cols-input').value);
        
        // Validate input
        if (isNaN(newRows) || isNaN(newCols)) {
            showMessage("Please enter valid numbers");
            return;
        }
        
        if (newRows < 5 || newRows > 30 || newCols < 5 || newCols > 30) {
            showMessage("Grid size must be between 5 and 30");
            return;
        }
        
        // Create new grid with updated dimensions
        this.grid.rows = newRows;
        this.grid.cols = newCols;
        this.grid.grid = this.grid.initializeGrid();
        
        // Reset start/end nodes
        this.grid.startNode = null;
        this.grid.endNode = null;
        
        // Reinitialize UI
        this.initializeUI();
        showMessage(`Grid resized to ${newRows}×${newCols}`);
    }


    initializeUI() {
        const gridElement = document.getElementById('grid');
        gridElement.innerHTML = '';

        for (let row = 0; row < this.grid.rows; row++) {
            for (let col = 0; col < this.grid.cols; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.id = `cell-${row}-${col}`;
                cell.dataset.row = row;
                cell.dataset.col = col;
                gridElement.appendChild(cell);
            }
        }
    }

    setupEventListeners() {
         // Tool selection buttons
        document.getElementById('start-btn').addEventListener('click', () => {
            this.setActiveTool('start');
        });
        document.getElementById('end-btn').addEventListener('click', () => {
            this.setActiveTool('end');
        });
        document.getElementById('wall-btn').addEventListener('click', () => {
            this.setActiveTool('wall');
        });
        document.getElementById('weight-btn').addEventListener('click', () => {
            this.setActiveTool('weight');
        });


        // Clear buttons
        document.getElementById('clear-all-btn').addEventListener('click', () => {
            this.grid.clearAll();
            this.updateGridUI();
            showMessage("Board cleared!");
        });

        // Algorithm controls
        document.getElementById('find-path-btn').addEventListener('click', () => {
            this.pathfinder.visualizePathfinding();
        });
        document.getElementById('clear-path-btn').addEventListener('click', () => {
            this.grid.clearPath();
            this.updateGridUI();
        });

        // Speed control
        const speedRange = document.getElementById('speed-range');
        const speedValue = document.getElementById('speed-value');
        speedRange.addEventListener('input', () => {
            const speed = parseInt(speedRange.value);
            this.pathfinder.setSpeed(speed);
            
            // Update speed label
            if (speed < 4) speedValue.textContent = 'Slow';
            else if (speed > 7) speedValue.textContent = 'Fast';
            else speedValue.textContent = 'Medium';
        });

        // Grid interaction
         const gridElement = document.getElementById('grid');
        gridElement.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('cell')) {
                this.isMouseDown = true;
                const row = parseInt(e.target.dataset.row);
                const col = parseInt(e.target.dataset.col);
                const node = this.grid.getNode(row, col);
                
                // Determine drag type
                if (node.isStart) this.dragType = 'start';
                else if (node.isEnd) this.dragType = 'end';
                else this.dragType = this.currentTool;
                
                this.handleCellInteraction(e.target);
            }
        });

        document.getElementById('resize-grid-btn').addEventListener('click', () => {
            if (this.pathfinder.isVisualizing) {
                showMessage("Finish current visualization first!");
                return;
            }
            this.resizeGrid();
        });

          // Prevent form submission on Enter key
        document.getElementById('rows-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.resizeGrid();
            }
        });
        
        document.getElementById('cols-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.resizeGrid();
            }
        });



        gridElement.addEventListener('mouseover', (e) => {
            if (this.isMouseDown && e.target.classList.contains('cell')) {
                this.handleCellInteraction(e.target);
            }
        });

        document.addEventListener('mouseup', () => {
            this.isMouseDown = false;
            this.dragType = null;
        });
        // Touch support for mobile devices
        gridElement.addEventListener('touchstart', (e) => {
            if (e.target.classList.contains('cell')) {
                this.isMouseDown = true;
                this.handleCellClick(e.target);
                e.preventDefault(); // Prevent scrolling
            }
        });

        gridElement.addEventListener('touchmove', (e) => {
            const touch = e.touches[0];
            const element = document.elementFromPoint(touch.clientX, touch.clientY);
            if (this.isMouseDown && element && element.classList.contains('cell')) {
                this.handleCellClick(element);
                e.preventDefault(); // Prevent scrolling
            }
        });

        document.addEventListener('touchend', () => {
            this.isMouseDown = false;
        });
    }

    setActiveTool(tool) {
        this.currentTool = tool;
        
        // Update button states
        document.getElementById('start-btn').classList.remove('active');
        document.getElementById('end-btn').classList.remove('active');
        document.getElementById('wall-btn').classList.remove('active');
        
        document.getElementById(`${tool}-btn`).classList.add('active');
    }

     initializeUI() {
        const gridElement = document.getElementById('grid');
        gridElement.innerHTML = '';
        
        // Set grid template based on current dimensions
        gridElement.style.gridTemplateColumns = `repeat(${this.grid.cols}, 1fr)`;
        gridElement.style.gridTemplateRows = `repeat(${this.grid.rows}, 1fr)`;
        
        for (let row = 0; row < this.grid.rows; row++) {
            for (let col = 0; col < this.grid.cols; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.id = `cell-${row}-${col}`;
                cell.dataset.row = row;
                cell.dataset.col = col;
                gridElement.appendChild(cell);
            }
        }
    }


    
    handleCellInteraction(cellElement) {
        const row = parseInt(cellElement.dataset.row);
        const col = parseInt(cellElement.dataset.col);
        
        if (this.dragType === 'start') {
            this.grid.setStartNode(row, col);
        } else if (this.dragType === 'end') {
            this.grid.setEndNode(row, col);
        } else {
            switch (this.currentTool) {
                case 'start':
                    this.grid.setStartNode(row, col);
                    break;
                case 'end':
                    this.grid.setEndNode(row, col);
                    break;
                case 'wall':
                    this.grid.toggleWallNode(row, col);
                    break;
                case 'weight':
                    this.grid.toggleWeightNode(row, col);
                    break;
            }
        }
        
        this.updateGridUI();
    }

    updateGridUI() {
        for (let row = 0; row < this.grid.rows; row++) {
            for (let col = 0; col < this.grid.cols; col++) {
                const node = this.grid.getNode(row, col);
                const cell = document.getElementById(`cell-${row}-${col}`);
                
                // Reset all classes
                cell.className = 'cell';
                cell.textContent = '';
                
                // Add appropriate classes and content
                if (node.isStart) {
                    cell.classList.add('start');
                    cell.textContent = '🚩';
                }
                if (node.isEnd) {
                    cell.classList.add('end');
                    cell.textContent = '🏁';
                }
                if (node.isWall) {
                    cell.classList.add('wall');
                    cell.textContent = '🧱';
                }
                if (node.isWeight) {
                    cell.classList.add('weight');
                    cell.textContent = '🔶';
                }
                if (node.isVisited) cell.classList.add('visited');
                if (node.isPath) cell.classList.add('path');
            }
        }
    }

    // Add to UIController class
    setupPaintbrushEffect() {
    const grid = document.getElementById('grid');
    
    grid.addEventListener('mousemove', (e) => {
        if (!e.target.classList.contains('cell')) return;
        
        // Create floating color orb
        const orb = document.createElement('div');
        orb.className = 'color-orb';
        orb.style.setProperty('--hue', Math.random() * 360);
        e.target.appendChild(orb);
        
        // Remove after animation
        setTimeout(() => orb.remove(), 1000);
    });
    }
}
