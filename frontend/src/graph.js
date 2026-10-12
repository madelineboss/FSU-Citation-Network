import * as d3 from "d3";

export function drawGraph(svgEl, data, { width = 960, height = 700 } = {}) {
  const nodes = data.nodes.map(d => ({ ...d, id: String(d.id) }));
  const links = data.links.map(d => ({
    ...d, source: String(d.source), target: String(d.target)
  }));

  const svg = d3.select(svgEl).attr("viewBox", [0, 0, width, height]);
  svg.selectAll("*").remove();
  const g = svg.append("g");                 // one container for links + nodes

  const link = g.append("g").attr("stroke", "#999").attr("stroke-opacity", 0.6)
    .selectAll("line").data(links).join("line")
    .attr("stroke-width", d => Math.sqrt(d.value));

  const node = g.append("g").selectAll("circle").data(nodes).join("circle")
    .attr("r", 4)
    .attr("fill", "#782F40")                 // FSU red
    .attr("stroke", "#fff").attr("stroke-width", 0.5);
  node.append("title").text(d => d.id);      // paper id on hover

  const sim = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(d => d.id).distance(30))
    .force("charge", d3.forceManyBody().strength(-30))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("x", d3.forceX(width / 2).strength(0.05))
    .force("y", d3.forceY(height / 2).strength(0.05));

  sim.on("tick", () => {
    link.attr("x1", d => d.source.x).attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x).attr("y2", d => d.target.y);
    node.attr("cx", d => d.x).attr("cy", d => d.y);
  });

  // zoom/pan on the svg, transform applied to the group
  const zoom = d3.zoom().scaleExtent([0.05, 20])
    .on("zoom", e => g.attr("transform", e.transform));
  svg.call(zoom);

  // drag individual nodes
  node.call(d3.drag()
    .on("start", (e, d) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
    .on("drag",  (e, d) => { d.fx = e.x; d.fy = e.y; })
    .on("end",   (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; }));

  // zoom-to-fit once the simulation settles
  function zoomToFit() {
    const xs = nodes.map(d => d.x), ys = nodes.map(d => d.y);
    const [x0, x1] = d3.extent(xs), [y0, y1] = d3.extent(ys);
    const pad = 40;
    const k = Math.min((width - 2 * pad) / (x1 - x0), (height - 2 * pad) / (y1 - y0), 8);
    const tx = width / 2 - k * (x0 + x1) / 2;
    const ty = height / 2 - k * (y0 + y1) / 2;
    svg.transition().duration(750)
       .call(zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(k));
  }
  sim.on("end", zoomToFit);

  return sim;
}