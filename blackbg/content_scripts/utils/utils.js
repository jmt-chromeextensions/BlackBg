function salutator() {
    alert('eeee');
}

function localizeAllTexts() {
    document.querySelectorAll('[data-localize-content]').forEach(elem => {
        elem.innerHTML = getLocalizedText(elem.innerHTML);
    });

    document.querySelectorAll('[data-localize-title]').forEach(elem => {
        elem.title = getLocalizedText(elem.title);
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

const hexToRgb = hex =>
  `rgb (${hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i
	,(m, r, g, b) => '#' + r + r + g + g + b + b)
.substring(1).match(/.{2}/g)
.map(x => parseInt(x, 16))
.join(", ")})`

// https://css-tricks.com/converting-color-spaces-in-javascript/
function hexAToRGBA(h) {
    let r = 0, g = 0, b = 0, a = 1;
  
    if (h.length == 5) {
      r = "0x" + h[1] + h[1];
      g = "0x" + h[2] + h[2];
      b = "0x" + h[3] + h[3];
      a = "0x" + h[4] + h[4];
  
    } else if (h.length == 9) {
      r = "0x" + h[1] + h[2];
      g = "0x" + h[3] + h[4];
      b = "0x" + h[5] + h[6];
      a = "0x" + h[7] + h[8];
    }
    a = +(a / 255).toFixed(3);
  
    return "rgba(" + +r + "," + +g + "," + +b + "," + a + ")";
}

// https://css-tricks.com/converting-color-spaces-in-javascript/
function RGBAToHexA(rgba) {
    let sep = rgba.indexOf(",") > -1 ? "," : " "; 
    rgba = rgba.substr(5).split(")")[0].split(sep);
                  
    // Strip the slash if using space-separated syntax
    if (rgba.indexOf("/") > -1)
      rgba.splice(3,1);
  
    for (let R in rgba) {
      let r = rgba[R];
      if (r.indexOf("%") > -1) {
        let p = r.substr(0,r.length - 1) / 100;
  
        if (R < 3) {
          rgba[R] = Math.round(p * 255);
        } else {
          rgba[R] = p;
        }
      }
    }

    let r = (+rgba[0]).toString(16),
    g = (+rgba[1]).toString(16),
    b = (+rgba[2]).toString(16),
    a = Math.round(+rgba[3] * 255).toString(16);

    if (r.length == 1)
    r = "0" + r;
    if (g.length == 1)
    g = "0" + g;
    if (b.length == 1)
    b = "0" + b;
    if (a.length == 1)
    a = "0" + a;

    return "#" + r + g + b + a;

  }

function getPaddedRandomHexColor () {
    let hex = ((1<<24)*Math.random()|0).toString(16);
    if (hex.length < 6)
        hex = "0".repeat(6 - hex.length) + hex;
    return "#"+((1<<24)*Math.random()|0).toString(16);
}

function toPaddedHexString(num, len) {
    str = num.toString(16);
    return "0".repeat(len - str.length) + str;
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


function setNextFocusElement(blurElement, focusElement) {
    blurElement.blur((e)=> {
        // if (lastElementFocus == blurElement)
            setTimeout(() => {
                console.log(blurElement);
                console.log(focusElement);
                focusElement.focus();
            });
        // lastElementFocus = blurElement;
    });
}

function setNextFocusElementList(elements) {

    let length = elements.length;

    for (let i = 0; i < length - 1; i++)
        setNextFocusElement(elements[i], elements[i+1]);

    setNextFocusElement(elements[length-1], elements[0]);
}

