function salutator() {
    alert('eeee');
}

// https://stackoverflow.com/a/1909508/9252531
function delayFunction (callback, ms) {
    var timer = 0;
    return function () {
        var context = this, args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function () {
            callback.apply(context, args);
        }, ms || 0);
    };
}

