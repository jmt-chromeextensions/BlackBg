function salutator() {
    alert('eeee');
}

function localizeAllTexts() {
    document.querySelectorAll('[data-localize]').forEach(elem => {
        if (elem.getAttribute('data-localize') === "title")
            elem.title = getLocalizedText(elem.title);
        else
            elem.innerHTML = getLocalizedText(elem.innerHTML);
    });
}

function getLocalizedText(textWithKey) {
    let key = textWithKey.indexOf("__MSG_") != -1 ? textWithKey.substring(6) : textWithKey; //__MSG_
    return chrome.i18n.getMessage(key);
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

function getRandomHexColor () {
    return "#"+((1<<24)*Math.random()|0).toString(16);
}

function addOrUpdateStylesheetRule(sheetSelector, selectorText, property, value, important) {
    let sheet = document.querySelector(sheetSelector).sheet;
    let rules = sheet.rules;
    let rulesForSelector = Object.values(rules).filter(r => r.selectorText === selectorText);

    if (rulesForSelector.length > 0) {

        let propertyRules = rulesForSelector.filter(p => p.style.cssText.startsWith(`${property}:`) || p.style.cssText.includes(`; ${property}:`));
        if (propertyRules.length > 0) {
            propertyRules.forEach(p => {
                if (!important)
                    p.style[property] = value;
                else {
                    let previousValue = p.style[property];
                    if (p.style.cssText.startsWith(`${property}:`)) 
                        if (p.style.cssText.includes(`${property}: ${previousValue} !important;`))
                            p.style.cssText = p.style.cssText.replace(`${property}: ${previousValue} !important;`, `${property}: ${value} !important;`)
                        else
                            p.style.cssText = p.style.cssText.replace(`${property}: ${previousValue};`, `${property}: ${value} !important;`)
                    else 
                        if (p.style.cssText.includes(`;${property}: ${previousValue} !important;`))
                            p.style.cssText = p.style.cssText.replace(`;${property}: ${previousValue} !important;`, `;${property}: ${value} !important;`)
                        else
                            p.style.cssText = p.style.cssText.replace(`;${property}: ${previousValue};`, `;${property}: ${value} !important;`)
                }
            });
        } else
            if (!important)
                rulesForSelector[0].style[property] = value;
            else 
                rulesForSelector[0].style.cssText += ` ${property}: ${value} !important;`;
    } else 
        sheet.insertRule(`${selectorText} { ${property}: ${value}${(important) ? " !important" : ""}; }`)

}

function deleteStylesheetRule(sheetSelector, selectorText, property) {

    let sheet = document.querySelector(sheetSelector).sheet;
    let rules = sheet.rules;
    
    if (selectorText) {

        let rulesForSelector = Object.values(rules).filter(r => r.selectorText === selectorText);

        if (!property) {
            rulesForSelector.map(function (r) {
                if (r.selectorText === selectorText)
                    sheet.deleteRule(r);
            });
        } else {

            let propertyRules = rulesForSelector.filter(p => p.style.cssText.startsWith(`${property}:`) || p.style.cssText.includes(`; ${property}:`));

            propertyRules.forEach(p => {
                p.style[property] = '';
            });

        }

    } else 
        sheet.innerHTML = '';

}

