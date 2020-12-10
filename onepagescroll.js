/* ===========================================================
 * onepagescroll.js v1.2.2
 * ===========================================================
 * Copyright 2014 Pete Rojwongsuriya.
 * http://www.thepetedesign.com
 *
 * Create an Apple-like website that let user scroll
 * one page at a time
 *
 * Credit: Eike Send for the awesome swipe event
 * https://github.com/peachananr/purejs-onepage-scroll
 *
 * License: GPL v3
 *
 * ========================================================== */

function onePageScroll(element, options) {

    let defaults = {
            sectionContainer: "section",
            easing: "ease",
            animationTime: 1000,
            pagination: true,
            updateURL: false,
            keyboard: true,
            beforeMove: null,
            afterMove: null,
            loop: false,
            responsiveFallback: false
        },
        settings = Object.extend({}, defaults, options),
        el = document.querySelector(element),
        sections = document.querySelectorAll(settings.sectionContainer),
        total = sections.length,
        topPos = 0,
        lastAnimation = 0,
        quietPeriod = 500,
        paginationList = "",
        body = document.querySelector('body');

    /*-------------------------------------------------------*/
    /*  Public Functions                                     */
    /*-------------------------------------------------------*/

    /*---------------------------------*/
    /*  Function to move down section  */
    /*---------------------------------*/

    const moveDown = function (el3) {

        if (typeof el3 == "string") el3 = document.querySelector(el3);

        let index = document.querySelector(settings.sectionContainer + ".active").dataset.index,
            current = document.querySelector(settings.sectionContainer + "[data-index='" + index + "']"),
            next = document.querySelector(settings.sectionContainer + "[data-index='" + (parseInt(index) + 1) + "']"),
            next_index = index,
            pos;
        if (!next) {
            if (settings.loop === true) {
                pos = 0;
                next = document.querySelector(settings.sectionContainer + "[data-index='1']");
            } else {
                return;
            }

        } else {
            pos = (index * 100) * -1;
            next_index = next.dataset.index;
            _removeClass(current, "active");
            _addClass(next, "active");

            if (settings.pagination === true) {
                _removeClass(document.querySelector(".onepage-pagination li a" + "[data-index='" + index + "']"), "active");
                _addClass(document.querySelector(".onepage-pagination li a" + "[data-index='" + next_index + "']"), "active");
            }

            body.className = body.className.replace(/\bviewing-page-\d.*?\b/g, '');
            _addClass(body, "viewing-page-" + next_index);

            if (history.replaceState && settings.updateURL === true) {
                let href = window.location.href.substr(0, window.location.href.indexOf('#')) + "#" + (parseInt(index) + 1);
                history.pushState({}, document.title, href);
            }
        }
        _transformPage(el3, settings, pos, next_index, next);
    };

    /*---------------------------------*/
    /*  Function to move up section    */
    /*---------------------------------*/

    const moveUp = function (el4) {

        if (typeof el4 == "string") el4 = document.querySelector(el4);

        let index = document.querySelector(settings.sectionContainer + ".active").dataset.index,
            current = document.querySelector(settings.sectionContainer + "[data-index='" + index + "']"),
            next = document.querySelector(settings.sectionContainer + "[data-index='" + (parseInt(index) - 1) + "']"),
            pos;

        if (!next) {
            if (settings.loop === true) {
                pos = ((total - 1) * 100) * -1;
                next = document.querySelector(settings.sectionContainer + "[data-index='" + total + "']");
            } else {
                return;
            }
        } else {
            pos = ((next.dataset.index - 1) * 100) * -1;
        }
        let next_index = next.dataset.index;
        _removeClass(current, "active");
        _addClass(next, "active");

        if (settings.pagination === true) {
            _removeClass(document.querySelector(".onepage-pagination li a" + "[data-index='" + index + "']"), "active");
            _addClass(document.querySelector(".onepage-pagination li a" + "[data-index='" + next_index + "']"), "active");
        }
        body.className = body.className.replace(/\bviewing-page-\d.*?\b/g, '');
        _addClass(body, "viewing-page-" + next_index);

        if (history.replaceState && settings.updateURL === true) {
            let href = window.location.href.substr(0, window.location.href.indexOf('#')) + "#" + (parseInt(index) - 1);
            history.pushState({}, document.title, href);
        }
        _transformPage(el4, settings, pos, next_index, next);
    };

    /*-------------------------------------------*/
    /*  Function to move to specified section    */
    /*-------------------------------------------*/

    const moveTo = function (el5, page_index) {

        if (typeof el5 == "string") el5 = document.querySelector(el5);

        let current = document.querySelector(settings.sectionContainer + ".active"),
            next = document.querySelector(settings.sectionContainer + "[data-index='" + (page_index) + "']"),
            pos;

        if (next) {
            let next_index = next.dataset.index;
            _removeClass(current, "active");
            _addClass(next, "active");
            _removeClass(document.querySelector(".onepage-pagination li a" + ".active"), "active");
            _addClass(document.querySelector(".onepage-pagination li a" + "[data-index='" + (page_index) + "']"), "active");

            body.className = body.className.replace(/\bviewing-page-\d.*?\b/g, '');
            _addClass(body, "viewing-page-" + next_index);

            pos = ((page_index - 1) * 100) * -1;

            if (history.replaceState && settings.updateURL === true) {
                let href = window.location.href.substr(0, window.location.href.indexOf('#')) + "#" + (parseInt(page_index) - 1);
                history.pushState({}, document.title, href);
            }
            _transformPage(el5, settings, pos, page_index, next);
        }
    };

    const _mouseWheelHandler = function (event) {
        // if (!event.target.classList.contains('scrollable')) {
        event.preventDefault();
        // noinspection JSUnresolvedVariable
        let delta = event.wheelDelta || -event.detail;
        if (!_hasClass(body, "disabled-onepage-scroll")) _init_scroll(event, delta);
        // }
    };

    const init = function () {
        /*-------------------------------------------*/
        /*  Prepare Everything                       */
        /*-------------------------------------------*/

        _addClass(el, "onepage-wrapper");
        el.style.position = "relative";
        let ii;

        for (ii = 0; ii < sections.length; ii++) {
            _addClass(sections[ii], "ops-section");
            sections[ii].dataset.index = ii + 1 + '';
            topPos = topPos + 100;

            if (settings.pagination === true) {
                paginationList += "<li><a data-index='" + (ii + 1) + "' href='#" + (ii + 1) + "'></a></li>";
            }
        }

        _swipeEvents(el);
        document.addEventListener("swipeDown", function (event) {
            if (!_hasClass(body, "disabled-onepage-scroll")) event.preventDefault();
            moveUp(el);
        });
        document.addEventListener("swipeUp", function (event) {
            if (!_hasClass(body, "disabled-onepage-scroll")) event.preventDefault();
            moveDown(el);
        });

        // Create Pagination and Display Them

        if (settings.pagination === true) {
            let pagination = document.createElement("ul");
            pagination.setAttribute("class", "onepage-pagination");

            body.appendChild(pagination);
            pagination.innerHTML = paginationList;
            document.querySelector(".onepage-pagination").style.marginTop = ((document.querySelector(".onepage-pagination").offsetHeight / 2) * -1) + '';
        }

        if (window.location.hash !== "" && window.location.hash !== "#1") {
            let init_index = window.location.hash.replace("#", ""),
                next = document.querySelector(settings.sectionContainer + "[data-index='" + (init_index) + "']"),
                next_index = next.dataset.index;

            _addClass(document.querySelector(settings.sectionContainer + "[data-index='" + init_index + "']"), "active");
            _addClass(body, "viewing-page-" + init_index);
            if (settings.pagination === true) _addClass(document.querySelector(".onepage-pagination li a" + "[data-index='" + init_index + "']"), "active");

            if (next) {
                _addClass(next, "active");
                if (settings.pagination === true) _addClass(document.querySelector(".onepage-pagination li a" + "[data-index='" + init_index + "']"), "active");

                body.className = body.className.replace(/\bviewing-page-\d.*?\b/g, '');
                _addClass(body, "viewing-page-" + next_index);
                if (history.replaceState && settings.updateURL === true) {
                    let href = window.location.href.substr(0, window.location.href.indexOf('#')) + "#" + (init_index);
                    history.pushState({}, document.title, href);
                }
            }
            let pos = ((init_index - 1) * 100) * -1;
            _transformPage(el, settings, pos, init_index);

        } else {
            _addClass(document.querySelector(settings.sectionContainer + "[data-index='1']"), "active");
            _addClass(body, "viewing-page-1");
            if (settings.pagination === true) _addClass(document.querySelector(".onepage-pagination li a[data-index='1']"), "active");
        }

        const _paginationHandler = function () {
            let page_index = this.dataset.index;
            moveTo(el, parseInt(page_index));
        };


        if (settings.pagination === true) {
            let pagination_links = document.querySelectorAll(".onepage-pagination li a");

            for (let i = 0; i < pagination_links.length; i++) {
                pagination_links[i].addEventListener('click', _paginationHandler);
            }
        }

        document.addEventListener('mousewheel', _mouseWheelHandler, {passive: false});
        document.addEventListener('DOMMouseScroll', _mouseWheelHandler, {passive: false});


        if (settings.responsiveFallback !== false) {
            window.onresize = function () {
                _responsive();
            };

            _responsive();
        }

        const _keydownHandler = function (e) {
            let tag = e.target.tagName.toLowerCase();

            if (!_hasClass(body, "disabled-onepage-scroll")) {
                switch (e.which) {
                    case 38:
                        if (tag !== 'input' && tag !== 'textarea') moveUp(el);
                        break;
                    case 40:
                        if (tag !== 'input' && tag !== 'textarea') moveDown(el);
                        break;
                    default:
                        return;
                }
            }
            return false;
        };

        if (settings.keyboard === true) {
            document.onkeydown = _keydownHandler;
        }
        return false;
    };

    /*-------------------------------------------------------*/
    /*  Private Functions                                    */
    /*-------------------------------------------------------*/
    /*------------------------------------------------*/
    /*  Credit: Eike Send for the awesome swipe event */
    /*------------------------------------------------*/
    const _swipeEvents = function (el) {
        let startX,
            startY;

        document.addEventListener("touchstart", touchstart);

        function touchstart(event) {
            let touches = event.touches;
            if (touches && touches.length) {
                startX = touches[0].pageX;
                startY = touches[0].pageY;
                document.addEventListener("touchmove", touchmove);
            }
        }

        function touchmove(event) {
            let touches = event.touches;
            if (touches && touches.length) {
                event.preventDefault();
                let deltaX = startX - touches[0].pageX;
                let deltaY = startY - touches[0].pageY;

                if (deltaX >= 50) {
                    document.dispatchEvent(new Event('swipeLeft'));
                }
                if (deltaX <= -50) {
                    document.dispatchEvent(new Event('swipeRight'));
                }
                if (deltaY >= 50) {
                    document.dispatchEvent(new Event('swipeUp'));
                }
                if (deltaY <= -50) {
                    document.dispatchEvent(new Event('swipeDown'));
                }

                if (Math.abs(deltaX) >= 50 || Math.abs(deltaY) >= 50) {
                    document.removeEventListener('touchmove', touchmove);
                }
            }
        }

    };
    /*-----------------------------------------------------------*/
    /*  Utility to add/remove class easily with javascript       */
    /*-----------------------------------------------------------*/

    const _trim = function (str) {
        return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    };

    const _hasClass = function (ele, cls) {
        if (ele.className) {
            return ele.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
        } else {
            return ele.className === cls;
        }
    };

    const _addClass = function (ele, cls) {
        if (!_hasClass(ele, cls)) ele.className += " " + cls;
        ele.className = _trim(ele.className);
    };

    const _removeClass = function (ele, cls) {
        if (_hasClass(ele, cls)) {
            let reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
            ele.className = ele.className.replace(reg, ' ');
        }
        ele.className = _trim(ele.className);
    };

    /*-----------------------------------------------------------*/
    /*  Transtionend Normalizer by Modernizr                     */
    /*-----------------------------------------------------------*/

    const _whichTransitionEvent = function () {
        let t,
            el = document.createElement('fakeelement'),
            transitions = {
                'transition': 'transitionend',
                'OTransition': 'oTransitionEnd',
                'MozTransition': 'transitionend',
                'WebkitTransition': 'webkitTransitionEnd'
            };

        for (t in transitions) {
            if (el.style[t] !== undefined) {
                return transitions[t];
            }
        }
    };

    /*-----------------------------------------------------------*/
    /*  Function to perform scroll to top animation              */
    /*-----------------------------------------------------------*/

    const _scrollTo = function (element, to, duration) {
        if (duration < 0) return;
        let difference = to - element.scrollTop,
            perTick = difference / duration * 10;

        setTimeout(function () {
            element.scrollTop = element.scrollTop + perTick;
            if (element.scrollTop === to) return;
            _scrollTo(element, to, duration - 10);
        }, 10);
    };


    /*---------------------------------*/
    /*  Function to transform the page */
    /*---------------------------------*/

    const _transformPage = function (el2, settings, pos, index, next_el) {
        if (typeof settings.beforeMove == 'function') settings.beforeMove(index, next_el);

        el2.style.cssText = "-webkit-transform: translate3d(0, " + pos + "%, 0); -webkit-transition: -webkit-transform " + settings.animationTime + "ms " + settings.easing + "; -moz-transform: translate3d(0, " + pos + "%, 0); -moz-transition: -moz-transform " + settings.animationTime + "ms " + settings.easing + "; -ms-transform: translate3d(0, " + pos + "%, 0); -ms-transition: -ms-transform " + settings.animationTime + "ms " + settings.easing + "; transform: translate3d(0, " + pos + "%, 0); transition: transform " + settings.animationTime + "ms " + settings.easing + ";";

        let transitionEnd = _whichTransitionEvent();
        el2.addEventListener(transitionEnd, endAnimation, false);

        function endAnimation() {
            if (typeof settings.afterMove == 'function') settings.afterMove(index, next_el);
            el2.removeEventListener(transitionEnd, endAnimation);
        }
    };

    /*-------------------------------------------*/
    /*  Responsive Fallback trigger              */
    /*-------------------------------------------*/

    const _responsive = function () {

        if (document.body.clientWidth < settings.responsiveFallback) {

            _addClass(body, "disabled-onepage-scroll");
            document.removeEventListener('mousewheel', _mouseWheelHandler);
            document.removeEventListener('DOMMouseScroll', _mouseWheelHandler);
            _swipeEvents(el);
            document.removeEventListener("swipeDown");
            document.removeEventListener("swipeUp");

        } else {

            if (_hasClass(body, "disabled-onepage-scroll")) {
                _removeClass(body, "disabled-onepage-scroll");
                _scrollTo(document.documentElement, 0, 2000);
            }


            _swipeEvents(el);
            document.addEventListener("swipeDown", function (event) {
                if (!_hasClass(body, "disabled-onepage-scroll")) event.preventDefault();
                moveUp(el);
            }, {passive: false});
            document.addEventListener("swipeUp", function (event) {
                if (!_hasClass(body, "disabled-onepage-scroll")) event.preventDefault();
                moveDown(el);
            }, {passive: false});

            document.addEventListener('mousewheel', _mouseWheelHandler, {passive: false});
            document.addEventListener('DOMMouseScroll', _mouseWheelHandler, {passive: false});

        }
    };

    /*-------------------------------------------*/
    /*  Initialize scroll detection              */
    /*-------------------------------------------*/

    const _init_scroll = function (event, delta) {
        let deltaOfInterest = delta,
            timeNow = new Date().getTime();

        // Cancel scroll if currently animating or within quiet period
        if (timeNow - lastAnimation < quietPeriod + settings.animationTime) {
            event.preventDefault();
            return;
        }

        if (deltaOfInterest < 0) {
            moveDown(el);
        } else {
            moveUp(el);
        }

        lastAnimation = timeNow;
    };

    init();
}

export {onePageScroll as default};

/*------------------------------------------------*/
/*  Ulitilities Method                            */
/*------------------------------------------------*/

/*-----------------------------------------------------------*/
/*  Function by John Resig to replicate extend functionality */
/*-----------------------------------------------------------*/

Object.extend = function (orig) {
    if (orig == null)
        return orig;

    for (let i = 1; i < arguments.length; i++) {
        let obj = arguments[i];
        if (obj != null) {
            for (let prop in obj) {
                let getter = obj.__lookupGetter__(prop),
                    setter = obj.__lookupSetter__(prop);

                if (getter || setter) {
                    if (getter)
                        orig.__defineGetter__(prop, getter);
                    if (setter)
                        orig.__defineSetter__(prop, setter);
                } else {
                    orig[prop] = obj[prop];
                }
            }
        }
    }

    return orig;
};
