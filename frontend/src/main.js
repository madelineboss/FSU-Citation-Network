import './style.css'
import { drawGraph } from "./graph.js"

document.querySelector('#app').innerHTML = `
  <h1>Citation Network Visualization in FSU (mab22bb, Madeline Boss)</h1>
  <p id="stats">Locading...</p>
  <svg id="graph" width="960" height="700"></svg>
`

fetch("http://localhost:5001/api/network")
  .then(r => r.json())
  .then(data => {
    document.getElementById("stats").textContent =
      `Papers: ${data.nodes.length} | Citation Links: ${data.links.length}`;
    drawGraph(document.getElementById("graph"), data);
  })
  .catch(err => {
    console.error("Failed to load network:", err);
    document.getElementById("stats").textContent = "Failed to load network";
  });