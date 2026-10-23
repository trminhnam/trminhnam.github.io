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
        element.innerHTML = '';
        Plotly.newPlot(element, figure.data, figure.layout, {
            responsive: true,
            displayModeBar: false,
        });
    });
});
