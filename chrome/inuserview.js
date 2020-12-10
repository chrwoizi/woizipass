'use strict';

const inuserview = function (elem) {
    let index
    if (!(elem instanceof Element)) throw Error('DomUtil: elem is not an element.');
    const style = getComputedStyle(elem)
    if (style.display === 'none') return false
    if (style.visibility !== 'visible') return false
    if (style.opacity === 0) return false
    if (elem.offsetWidth + elem.offsetHeight + elem.getBoundingClientRect().height +
        elem.getBoundingClientRect().width === 0) {
        return false
    }
    const elementPoints = {
        'center': {
            x: elem.getBoundingClientRect().left + elem.offsetWidth / 2,
            y: elem.getBoundingClientRect().top + elem.offsetHeight / 2
        },
        'top-left': {
            x: elem.getBoundingClientRect().left,
            y: elem.getBoundingClientRect().top
        },
        'top-right': {
            x: elem.getBoundingClientRect().right,
            y: elem.getBoundingClientRect().top
        },
        'bottom-left': {
            x: elem.getBoundingClientRect().left,
            y: elem.getBoundingClientRect().bottom
        },
        'bottom-right': {
            x: elem.getBoundingClientRect().right,
            y: elem.getBoundingClientRect().bottom
        }
    }

    for (index in elementPoints) {
        const point = elementPoints[index]
        if (point.x < 0) return false
        if (point.x > (document.documentElement.clientWidth || window.innerWidth)) return false
        if (point.y < 0) return false
        if (point.y > (document.documentElement.clientHeight || window.innerHeight)) return false
        let pointContainer = document.elementFromPoint(point.x, point.y)
        if (pointContainer !== null) {
            do {
                if (pointContainer === elem) {
                    return true
                }
            } while (pointContainer = pointContainer.parentNode)
        }
    }
    return false
}

const $ = jQuery
$.extend($.expr[':'], {
    "inuserview": inuserview
})
