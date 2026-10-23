// Draw the interactive result figures. Each static/plots/<stem>.js file
// (written by notebooks/v1) registers a Plotly figure in window.GRAPHNIAH_PLOTS;
// it replaces the fallback image inside <div data-plot="<stem>">.
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
        var layout = figure.layout;
        if (element.clientWidth < 560) {
            layout = narrowLayout(figure.data, layout);
        }
        element.innerHTML = '';
        Plotly.newPlot(element, figure.data, layout, {
            responsive: true,
            displayModeBar: false,
        });
    });
});

// On phones, the per-column legends (legend, legend2, ...) overlap each other and
// fixed horizontal tick labels run together. Merge the legends into one that wraps
// above the plot, and let Plotly tilt tick labels that do not fit.
function narrowLayout(data, layout) {
    var narrow = JSON.parse(JSON.stringify(layout));
    var legendKeys = Object.keys(narrow).filter(function (key) { return /^legend\d+$/.test(key); });
    if (legendKeys.length) {
        data.forEach(function (trace) { delete trace.legend; });
        legendKeys.forEach(function (key) { delete narrow[key]; });
        narrow.legend = Object.assign({}, narrow.legend, {
            orientation: 'h', x: 0.5, xanchor: 'center', y: 1.02, yanchor: 'bottom', font: { size: 11 },
        });
        narrow.margin = Object.assign({}, narrow.margin, { t: 16 });
    }
    Object.keys(narrow).forEach(function (key) {
        if (/^xaxis\d*$/.test(key)) {
            delete narrow[key].tickangle;
            narrow[key].tickfont = Object.assign({ size: 11 }, narrow[key].tickfont);
        }
    });
    return narrow;
}
