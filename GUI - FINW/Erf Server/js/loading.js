var createLoader = (function () {

    var container = null;
    var progress = null;
    var finished = false;

    var canvas = null;
    var callback = null;

    function setupLoaderElement() {
        container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.top = '50%';
        container.style.left = '50%';
        container.style.transform = 'translate(-50%, -50%)';
        container.style.transition = 'opacity 1s';

        var text = document.createElement('p');
        text.style.margin = '0 0 10px';
        text.style.paddingLeft = '5px';
        text.style.textAlign = 'center';
        text.style.color = '#fff';
        text.style.fontFamily = 'monospace';
        text.style.fontSize = '16px';
        text.style.letterSpacing = '10px';
        text.textContent = 'LOADING';

        var progressCtn = document.createElement('div');
        progressCtn.style.background = '#555';
        progressCtn.style.width = '250px';
        progressCtn.style.height = '1px';

        progress = document.createElement('div');
        progress.style.background = '#fff';
        progress.style.width = '0%';
        progress.style.height = 'inherit';
        progress.style.margin = '0 auto';
        progress.style.transition = 'width 0.15s';

        progressCtn.appendChild(progress);
        container.appendChild(text);
        container.appendChild(progressCtn);

        document.body.appendChild(container);
    }

    function setupCanvas() {
        canvas.style.transition = 'opacity 1s';
        canvas.style.opacity = '0';
    }

    function updateProgress(rate) {
        progress.style.width = Math.round(rate * 100.0) + '%';
    }

    function hideLoader() {
        container.style.opacity = '0';
        setTimeout(function () {
            document.body.removeChild(container);
        }, 1000);
    }

    function showCanvas() {
        document.body.appendChild(canvas);
        if (typeof callback === 'function') {
            callback();
        }
        setTimeout(function () {
            canvas.style.opacity = '1';
        }, 0);
    }

    return function (_canvas, _callback) {
        var manager = new THREE.LoadingManager();

        canvas = _canvas;
        callback = _callback;

        setupLoaderElement();
        setupCanvas();

        manager.onProgress = function (item, loaded, total) {
            updateProgress(loaded / total);
            if (loaded === total && !finished) {
                finished = true;
                hideLoader();
                setTimeout(function () {
                    showCanvas();
                }, 1000);
            }
        };

        return manager;
    }

})();
