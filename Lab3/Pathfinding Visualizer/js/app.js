let grid = new Grid();

function runAlgorithm() {
  grid.resetNodes();
  if (!grid.startNode || !grid.endNode) {
    alert('Please set both start and end points.');
    return;
  }
  aStar(grid);
}

document.getElementById('gridSize').addEventListener('change', (e) => {
  const size = parseInt(e.target.value);
  grid = new Grid(size);
});

