/** @odoo-module */

import publicWidget from "@web/legacy/js/public/public_widget";

function _rafThrottle(fn) {
    let scheduled = false;
    let lastArgs;
    return function (...args) {
        lastArgs = args;
        if (scheduled) {
            return;
        }
        scheduled = true;
        requestAnimationFrame(() => {
            scheduled = false;
            fn.apply(this, lastArgs);
        });
    };
}

publicWidget.registry.ntiMarquee = publicWidget.Widget.extend({
    selector: ".s_nti_marquee .nti_web_snippet__marquee, .s_nti_marquee_inner .nti_web_snippet__marquee, .s_nti_card_marquee .nti_web_snippet__marquee, .s_nti_feedback_marquee .nti_web_snippet__marquee, .s_nti_feedback_marquee_2 .nti_web_snippet__marquee",

    start() {
        this._syncAll();
        this._observePrimaryGroup();
        this._observeResizes();
        return this._super(...arguments);
    },

    destroy() {
        this._isDestroyed = true;
        if (this._observer) {
            this._observer.disconnect();
            this._observer = null;
        }
        if (this._resizeObserver) {
            this._resizeObserver.disconnect();
            this._resizeObserver = null;
        }
        return this._super(...arguments);
    },

    //--------------------------------------------------------------------------
    // Private
    //--------------------------------------------------------------------------

    _getPrimaryGroup() {
        return this.el.querySelector(".nti_web_snippet__marquee__group--primary");
    },

    _setDistance() {
        const primary = this._getPrimaryGroup();
        if (!primary) {
            return;
        }
        // scrollWidth includes padding and is stable for flex content width.
        const distance = primary.scrollWidth || 0;
        this.el.style.setProperty("--nti-marquee-distance", `${distance}px`);
    },

    _syncClone() {
        const primary = this._getPrimaryGroup();
        const track = this.el.querySelector(".nti_web_snippet__marquee__track");
        
        if (!primary || !track) {
            return;
        }

        // Remove old clones
        const oldClones = this.el.querySelectorAll(".nti_web_snippet__marquee__group--clone");
        oldClones.forEach(el => el.remove());

        const primaryWidth = primary.scrollWidth;
        const viewportWidth = this.el.clientWidth;
        
        // At minimum, we need enough clones to fill the screen if the primary group is small.
        // We add +1 extra clone as a buffer so the end of the loop never enters the screen before it snaps back.
        let multiplier = 1;
        if (primaryWidth > 0 && viewportWidth > 0) {
            multiplier = Math.ceil(viewportWidth / primaryWidth) + 1;
        }

        for (let i = 0; i < multiplier; i++) {
            const clone = primary.cloneNode(true);
            clone.classList.remove("nti_web_snippet__marquee__group--primary");
            clone.classList.add("nti_web_snippet__marquee__group--clone");
            clone.setAttribute("aria-hidden", "true");
            track.appendChild(clone);
        }
    },

    _syncAll() {
        if (this._isDestroyed) return;
        this._syncClone();
        this._setDistance();
    },

    _observePrimaryGroup() {
        const primary = this._getPrimaryGroup();
        if (!primary) {
            return;
        }
        const sync = _rafThrottle(() => this._syncAll());
        this._observer = new MutationObserver(sync);
        this._observer.observe(primary, {
            childList: true,
            subtree: true,
            attributes: true,
            characterData: true,
        });
    },

    _observeResizes() {
        const primary = this._getPrimaryGroup();
        const viewport = this.el.querySelector(".nti_web_snippet__marquee__viewport");
        const sync = _rafThrottle(() => this._syncAll());

        this._resizeObserver = new ResizeObserver(sync);
        if (viewport) {
            this._resizeObserver.observe(viewport);
        }
        if (primary) {
            this._resizeObserver.observe(primary);
        }
    },
});

