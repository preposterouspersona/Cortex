import { useEffect, useRef } from "react";
import * as d3 from "d3";

const TAG_COLORS = [
  "#8b5cf6", "#06b6d4", "#f59e0b", "#10b981",
  "#f43f5e", "#3b82f6", "#a855f7", "#14b8a6",
];

function tagColor(tag) {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
}

function nodeColor(note) {
  if (!note.tags || note.tags.length === 0) return "#8b5cf6";
  return tagColor(note.tags[0]);
}

function nodeRadius(note) {
  const base = 10;
  const linked = (note.linkedIds || []).length;
  return Math.min(base + linked * 3, 26);
}

export default function Graph({ notes, onSelectNote, selectedId }) {
  const svgRef = useRef(null);
  const simRef = useRef(null);

  useEffect(() => {
    if (!svgRef.current || notes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const W = window.innerWidth;
    const H = window.innerHeight;

    svg.attr("width", W).attr("height", H);

    // Build links from linkedIds
    const links = [];
    notes.forEach((n) => {
      (n.linkedIds || []).forEach((lid) => {
        const target = notes.find((x) => x._id === lid);
        if (target) links.push({ source: n._id, target: lid });
      });
    });

    const nodes = notes.map((n) => ({ ...n, id: n._id }));

    // Zoom
    const g = svg.append("g");
    const zoom = d3.zoom().scaleExtent([0.2, 3]).on("zoom", (e) => {
      g.attr("transform", e.transform);
    });
    svg.call(zoom);

    // Simulation
    const sim = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d) => d.id).distance(120).strength(0.4))
      .force("charge", d3.forceManyBody().strength(-320))
      .force("center", d3.forceCenter(W / 2, H / 2))
      .force("collision", d3.forceCollide().radius((d) => nodeRadius(d) + 18));

    simRef.current = sim;

    // Links
    const linkEl = g.append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("class", "link-line")
      .attr("stroke-width", 1)
      .attr("stroke", "rgba(139,92,246,0.2)");

    // Node groups
    const nodeG = g.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .attr("class", "node-group")
      .style("cursor", "pointer")
      .call(
        d3.drag()
          .on("start", (e, d) => {
            if (!e.active) sim.alphaTarget(0.3).restart();
            d.fx = d.x; d.fy = d.y;
          })
          .on("drag", (e, d) => { d.fx = e.x; d.fy = e.y; })
          .on("end", (e, d) => {
            if (!e.active) sim.alphaTarget(0);
            d.fx = null; d.fy = null;
          })
      )
      .on("click", (e, d) => {
        e.stopPropagation();
        onSelectNote(d._id);
      });

    // Glow filter
    const defs = svg.append("defs");
    const filter = defs.append("filter").attr("id", "glow");
    filter.append("feGaussianBlur").attr("stdDeviation", "3").attr("result", "coloredBlur");
    const merge = filter.append("feMerge");
    merge.append("feMergeNode").attr("in", "coloredBlur");
    merge.append("feMergeNode").attr("in", "SourceGraphic");

    // Outer ring (for selected)
    nodeG.append("circle")
      .attr("r", (d) => nodeRadius(d) + 6)
      .attr("fill", "none")
      .attr("stroke", (d) => nodeColor(d))
      .attr("stroke-width", 1)
      .attr("opacity", (d) => (d._id === selectedId ? 0.6 : 0))
      .attr("class", "node-ring");

    // Main circle
    nodeG.append("circle")
      .attr("r", (d) => nodeRadius(d))
      .attr("fill", (d) => nodeColor(d))
      .attr("fill-opacity", 0.85)
      .attr("stroke", (d) => nodeColor(d))
      .attr("stroke-width", 1.5)
      .attr("filter", "url(#glow)")
      .attr("class", "node-circle");

    // Label
    nodeG.append("text")
      .attr("class", "node-label")
      .attr("text-anchor", "middle")
      .attr("dy", (d) => nodeRadius(d) + 14)
      .text((d) => d.title.length > 18 ? d.title.slice(0, 16) + "…" : d.title);

    // Tag dots
    nodeG.each(function(d) {
      const tags = (d.tags || []).slice(0, 3);
      tags.forEach((tag, i) => {
        d3.select(this).append("circle")
          .attr("r", 3)
          .attr("cx", (i - (tags.length - 1) / 2) * 9)
          .attr("cy", (dd) => -nodeRadius(dd) - 5)
          .attr("fill", tagColor(tag))
          .attr("opacity", 0.9);
      });
    });

    // Tick
    sim.on("tick", () => {
      linkEl
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      nodeG.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    // Click on canvas to deselect
    svg.on("click", () => onSelectNote(null));

    return () => sim.stop();
  }, [notes]);

  // Update ring visibility when selection changes
  useEffect(() => {
    if (!svgRef.current) return;
    d3.select(svgRef.current)
      .selectAll(".node-ring")
      .attr("opacity", (d) => (d._id === selectedId ? 0.6 : 0));
  }, [selectedId]);

  return (
    <svg
      ref={svgRef}
      id="graph-canvas"
      style={{ position: "fixed", inset: 0 }}
    />
  );
}
