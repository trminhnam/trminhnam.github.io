// Draw the interactive result figures. Each static/plots/<stem>.js file
// (written by notebooks/v1) registers a Plotly figure in window.GRAPHNIAH_PLOTS;
// it replaces the fallback image inside <div data-plot="<stem>">.

// Below this plot width (phones), use the phone layout: an HTML legend with one
// row per model family and smaller, horizontal tick labels.
var NARROW_WIDTH = 560;
// Below this plot width (the smallest phones), use an even smaller tick font,
// so long category labels such as disjoint-component do not run together.
var TINY_WIDTH = 340;
// Bulma stacks .columns below this window width. The three small figures then
// sit one under another, so each gets its own legend (CSS hides the shared one).
var STACKED_WIDTH = 769;
var SVG_NS = 'http://www.w3.org/2000/svg';

document.addEventListener('DOMContentLoaded', function () {
    if (typeof Plotly === 'undefined') {
        return;  // Plotly did not load: keep the fallback images
    }
    var figures = window.GRAPHNIAH_PLOTS || {};
    document.querySelectorAll('[data-plot]').forEach(function (element) {
        var figure = figures[element.dataset.plot];
        if (!figure) {
            return;
        }
        var mode = layoutMode(element);
        drawFigure(element, figure, mode);
        // Rotating a phone or resizing the window can cross a limit: redraw then.
        var timer = null;
        window.addEventListener('resize', function () {
            clearTimeout(timer);
            timer = setTimeout(function () {
                var next = layoutMode(element);
                if (JSON.stringify(next) !== JSON.stringify(mode)) {
                    mode = next;
                    drawFigure(element, figure, mode);
                }
            }, 150);
        });
    });
});

function layoutMode(element) {
    return {
        narrow: element.clientWidth < NARROW_WIDTH,
        tiny: element.clientWidth < TINY_WIDTH,
        ownLegend: element.classList.contains('small-plot') && window.innerWidth < STACKED_WIDTH,
    };
}

function drawFigure(element, figure, mode) {
    var chart = element.querySelector('.plot-chart');
    if (chart) {
        Plotly.purge(chart);
    }
    element.innerHTML = '';
    // Copies, so redrawing in the other layout starts from the original figure.
    var data = JSON.parse(JSON.stringify(figure.data));
    var layout = staticLayout(figure.layout);
    var legend = null;
    if ((mode.narrow && layout.showlegend !== false) || mode.ownLegend) {
        legend = htmlLegend(data);
    }
    if (mode.narrow) {
        // Figures with several columns of subplots (xaxis2, ...) have the least
        // room per tick label.
        var tickSize = mode.tiny ? ('xaxis2' in layout ? 8 : 9) : 10;
        layout = narrowLayout(layout, tickSize);
    }
    if (legend) {
        element.appendChild(legend);
    }
    chart = document.createElement('div');
    chart.className = 'plot-chart';
    element.appendChild(chart);
    Plotly.newPlot(chart, data, layout, { responsive: true, displayModeBar: false });
    if (element.querySelector('.plot-legend')) {
        connectLegend(element.querySelector('.plot-legend'), chart);
    }
}

// No zooming or panning. With dragmode false, Plotly does not call
// preventDefault on touchstart, so a swipe over a figure scrolls the page
// instead of drawing a zoom box. Tapping or hovering still shows the values.
function staticLayout(original) {
    var layout = JSON.parse(JSON.stringify(original));
    layout.dragmode = false;
    Object.keys(layout).forEach(function (key) {
        if (/^[xy]axis\d*$/.test(key)) {
            layout[key].fixedrange = true;
        }
    });
    return layout;
}

// Phone layout: the HTML legend replaces Plotly's legends, so the plot can use
// the top margin; tick labels stay horizontal in a smaller font.
function narrowLayout(layout, tickSize) {
    Object.keys(layout).forEach(function (key) {
        if (/^legend\d*$/.test(key)) {
            delete layout[key];
        }
    });
    layout.showlegend = false;
    layout.margin = Object.assign({}, layout.margin, { l: 48, r: 8, t: 16 });
    Object.keys(layout).forEach(function (key) {
        if (/^xaxis\d*$/.test(key)) {
            layout[key].tickangle = 0;
            layout[key].tickfont = Object.assign({}, layout[key].tickfont, { size: tickSize });
        }
        if (/^yaxis\d*$/.test(key)) {
            layout[key].tickfont = Object.assign({}, layout[key].tickfont, { size: 11 });
        }
    });
    return layout;
}

// One row per Plotly legend (legend, legend2, ...): in the depth figure, one
// row per model family, as the paper's per-column legends. When the names of
// a row share a family prefix (GPT-5.6-Sol, GPT-5.6-Luna), the row shows the
// family once and the short names after it, in a grid aligned across rows, so
// each family fits on one line even on small phones. Each entry is a button
// that hides or shows its model.
function htmlLegend(data) {
    var rows = {};
    var order = [];
    data.forEach(function (trace) {
        if (trace.showlegend === false || !trace.name) {
            return;
        }
        var key = trace.legend || 'legend';
        if (!rows[key]) {
            rows[key] = [];
            order.push(key);
        }
        rows[key].push(trace);
    });
    if (!order.length) {
        return null;
    }
    var prefixes = order.map(function (key) {
        return familyPrefix(rows[key].map(function (trace) { return trace.name; }));
    });
    var legend = document.createElement('div');
    legend.className = 'plot-legend';
    if (prefixes.every(function (prefix) { return prefix; })) {
        var columns = Math.max.apply(null, order.map(function (key) { return rows[key].length; }));
        legend.classList.add('plot-legend-grid');
        legend.style.gridTemplateColumns = 'auto repeat(' + columns + ', auto)';
        order.forEach(function (key, row) {
            var label = document.createElement('span');
            label.className = 'plot-legend-family';
            label.textContent = prefixes[row].replace(/-$/, '');
            legend.appendChild(label);
            rows[key].forEach(function (trace) {
                legend.appendChild(legendItem(trace, trace.name.slice(prefixes[row].length)));
            });
            // Empty cells keep a shorter family's row aligned with the others.
            for (var i = rows[key].length; i < columns; i++) {
                legend.appendChild(document.createElement('span'));
            }
        });
    } else {
        order.forEach(function (key) {
            var row = document.createElement('div');
            row.className = 'plot-legend-row';
            rows[key].forEach(function (trace) {
                row.appendChild(legendItem(trace, trace.name));
            });
            legend.appendChild(row);
        });
    }
    return legend;
}

// Longest start shared by all names that ends at a hyphen ("GPT-5.6-"), or ""
// for a single name or names without one.
function familyPrefix(names) {
    if (names.length < 2) {
        return '';
    }
    var prefix = names[0];
    names.forEach(function (name) {
        while (name.indexOf(prefix) !== 0) {
            prefix = prefix.slice(0, -1);
        }
    });
    return prefix.slice(0, prefix.lastIndexOf('-') + 1);
}

function legendItem(trace, text) {
    var item = document.createElement('button');
    item.type = 'button';
    item.className = 'plot-legend-item';
    item.dataset.group = trace.legendgroup || trace.name;
    item.setAttribute('aria-pressed', 'true');
    item.title = 'Hide or show ' + trace.name;
    item.appendChild(legendSwatch(trace));
    item.appendChild(document.createTextNode(text));
    return item;
}

function connectLegend(legend, chart) {
    legend.querySelectorAll('.plot-legend-item').forEach(function (item) {
        item.addEventListener('click', function () {
            var shown = item.getAttribute('aria-pressed') !== 'true';
            var indices = [];
            chart.data.forEach(function (trace, index) {
                if ((trace.legendgroup || trace.name) === item.dataset.group) {
                    indices.push(index);
                }
            });
            Plotly.restyle(chart, { visible: shown }, indices);
            item.setAttribute('aria-pressed', String(shown));
        });
    });
}

// A short line with the model's marker (line figures), or a filled square (bar figures).
function legendSwatch(trace) {
    var svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', 'plot-legend-swatch');
    svg.setAttribute('viewBox', '0 0 24 12');
    svg.setAttribute('aria-hidden', 'true');
    var color = (trace.marker && trace.marker.color) || (trace.line && trace.line.color) || '#64748b';
    if (trace.type === 'bar') {
        svg.appendChild(svgElement('rect', { x: 6, y: 0, width: 12, height: 12, rx: 2, fill: color }));
        return svg;
    }
    svg.appendChild(svgElement('line', { x1: 0, y1: 6, x2: 24, y2: 6, stroke: color, 'stroke-width': 2 }));
    var symbol = String((trace.marker && trace.marker.symbol) || 'circle');
    var open = /-open$/.test(symbol);
    svg.appendChild(svgElement('path', {
        d: markerPath(symbol.replace(/-open$/, ''), 12, 6, 4),
        fill: open ? '#ffffff' : color,
        stroke: color,
        'stroke-width': 1.5,
        'stroke-linejoin': 'round',
    }));
    return svg;
}

function svgElement(name, attributes) {
    var element = document.createElementNS(SVG_NS, name);
    Object.keys(attributes).forEach(function (key) {
        element.setAttribute(key, attributes[key]);
    });
    return element;
}

// SVG path of a Plotly marker symbol centered at (x, y) with radius r.
function markerPath(symbol, x, y, r) {
    function polygon(points) {
        return 'M' + points.map(function (p) { return (x + p[0] * r) + ',' + (y + p[1] * r); }).join('L') + 'Z';
    }
    switch (symbol) {
        case 'square':
            return polygon([[-0.85, -0.85], [0.85, -0.85], [0.85, 0.85], [-0.85, 0.85]]);
        case 'diamond':
            return polygon([[0, -1.1], [1.1, 0], [0, 1.1], [-1.1, 0]]);
        case 'triangle-up':
            return polygon([[0, -1.1], [1.05, 0.8], [-1.05, 0.8]]);
        case 'triangle-down':
            return polygon([[0, 1.1], [1.05, -0.8], [-1.05, -0.8]]);
        case 'triangle-right':
            return polygon([[1.1, 0], [-0.8, 1.05], [-0.8, -1.05]]);
        case 'triangle-left':
            return polygon([[-1.1, 0], [0.8, 1.05], [0.8, -1.05]]);
        case 'cross':
            return polygon([[-0.35, -1], [0.35, -1], [0.35, -0.35], [1, -0.35], [1, 0.35], [0.35, 0.35],
                [0.35, 1], [-0.35, 1], [-0.35, 0.35], [-1, 0.35], [-1, -0.35], [-0.35, -0.35]]);
        case 'star':
            var points = [];
            for (var i = 0; i < 10; i++) {
                var angle = -Math.PI / 2 + i * Math.PI / 5;
                var radius = i % 2 ? 0.45 : 1.15;
                points.push([radius * Math.cos(angle), radius * Math.sin(angle)]);
            }
            return polygon(points);
        default:  // circle
            return 'M' + (x - r) + ',' + y + 'a' + r + ',' + r + ' 0 1,0 ' + (2 * r) + ',0a' + r + ',' + r + ' 0 1,0 ' + (-2 * r) + ',0Z';
    }
}
