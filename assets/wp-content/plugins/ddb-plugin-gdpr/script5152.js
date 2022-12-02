
/* Simple cookie framework */ 
/* https://github.com/madmurphy/cookies.js (GPL3) */
!function(){function e(e,o,t,n,r,s,c){var i="";if(t)switch(t.constructor){case Number:i=t===1/0?"; expires=Fri, 31 Dec 9999 23:59:59 GMT":"; max-age="+t;break;case String:i="; expires="+t;break;case Date:i="; expires="+t.toUTCString()}return encodeURIComponent(e)+"="+encodeURIComponent(o)+i+(r?"; domain="+r:"")+(n?"; path="+n:"")+(s?"; secure":"")+(!c||"no_restriction"===c.toString().toLowerCase()||c<0?"":"lax"===c.toString().toLowerCase()||1===Math.ceil(c)||!0===c?"; samesite=lax":"; samesite=strict")}var o=/[\-\.\+\*]/g,t=/^(?:expires|max\-age|path|domain|secure|samesite|httponly)$/i;window.docCookies={getItem:function(e){return e&&decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*"+encodeURIComponent(e).replace(o,"\\$&")+"\\s*\\=\\s*([^;]*).*$)|^.*$"),"$1"))||null},setItem:function(o,n,r,s,c,i,a){return!(!o||t.test(o))&&(document.cookie=e(o,n,r,s,c,i,a),!0)},removeItem:function(o,t,n,r,s){return!!this.hasItem(o)&&(document.cookie=e(o,"","Thu, 01 Jan 1970 00:00:00 GMT",t,n,r,s),!0)},hasItem:function(e){return!(!e||t.test(e))&&new RegExp("(?:^|;\\s*)"+encodeURIComponent(e).replace(o,"\\$&")+"\\s*\\=").test(document.cookie)},keys:function(){for(var e=document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g,"").split(/\s*(?:\=[^;]*)?;\s*/),o=e.length,t=0;t<o;t++)e[t]=decodeURIComponent(e[t]);return e},clear:function(e,o,t,n){for(var r=this.keys(),s=r.length,c=0;c<s;c++)this.removeItem(r[c],e,o,t,n)}}}(),"undefined"!=typeof module&&void 0!==module.exports&&(module.exports=docCookies);

/*
 *  Project: OB - DDB GDPR Banner
 *  Date: January 6, 2020
 *  Author: Office/Bureau
 *  Version: 1.0
 */
;
(function(window, document, docCookies, undefined) {
    "use strict";

    function obDDBGDPR(element) {
        this.$element = element;
        this.$button_acceptInitial = document.getElementById('ddbgdpr-banner__initial_accept');
        this.$button_acceptAll = document.getElementById('ddbgdpr_accept');
        this.$button_rejectAll = document.getElementById('ddbgdpr_reject');
        this.$button_submit = document.getElementById('ddbgdpr_submit');
        this.$button_close = document.getElementById('ddbgdpr-banner__close');
        this.forms = this.$element.querySelectorAll('form');
        this.choices = this.$element.querySelectorAll('.ddbgdpr-banner__choice');
        this.response = document.getElementById('ddbgdpr-banner__response');
        this.needsRefresh = false;
        this.init();
    }

    obDDBGDPR.prototype = {
    init: function() {
        var self = this;
        if( self.$element.classList.contains('ddbgdpr-banner--no-prefs') ){
            setTimeout(function(){
                self.$element.classList.add('ddbgdpr-banner--visible');
            },250);
        }
        this.setListeners();
    },
    setListeners: function() {
        var self = this;
        Array.prototype.forEach.call(self.forms, function(form) {
            form.addEventListener('submit',function(e){
                e.preventDefault();
            });
        });
        self.$button_acceptInitial.addEventListener('click', function(e) {
            self.needsRefresh = false;
            self.updateForm('accept');
            self.updateCookies();
            self.updateBanner();
        });
        self.$button_acceptAll.addEventListener('click', function(e) {
            self.needsRefresh = false;
            self.updateForm('accept');
            self.updateCookies();
            self.updateBanner();
        });
        self.$button_rejectAll.addEventListener('click', function(e) {
            self.needsRefresh = false;
            self.updateForm('reject');
            self.updateCookies();
            self.updateBanner();
        });
        self.$button_submit.addEventListener('click', function(e) {
            self.needsRefresh = false;
            self.updateCookies();
            self.updateBanner();
        });

        self.$button_close.addEventListener('click',function(e){
            self.closeBanner();
        })

    },
    updateForm: function( type ){
        var self = this;
        Array.prototype.forEach.call(self.choices, function(choice) {
            if( type === 'accept' ){
                choice.checked = true;
            }
            if( type == 'reject' ){
                choice.checked = false;
            }
        });
    },
    updateCookies: function(){
        var self = this;
        var cookieExpiry = new Date();
        cookieExpiry.setFullYear(cookieExpiry.getFullYear() + 1);
        //Set preference cookies
        Array.prototype.forEach.call(self.choices, function(choice) {
            var cookieName = choice.getAttribute('name');
            var cookieValue = choice.checked;
            docCookies.setItem(cookieName, cookieValue, cookieExpiry, '/');
            
            //If any cookies have been rejected, a reload is required
            if( !choice.checked ){
                self.needsRefresh = true;
            }
        });

        //Unset all non-preference cookies
        var cookies = docCookies.keys();
        Array.prototype.forEach.call(cookies, function(cookie) {
            if( cookie.indexOf('ddbcp') === -1 ){
                 docCookies.removeItem(cookie);
            }
        });
        
        //Add the preferences flag
        //The banner checks for this flag and shows the initial 'no preferences' state if it's not present
        docCookies.setItem('__ddbcp', true, cookieExpiry, '/');
    },
    updateBanner: function(){
        var self = this;
        self.$element.classList.add('ddbgdpr-banner--updated');
        setTimeout(function(){
            self.$element.classList.remove('ddbgdpr-banner--updated');
        },250);
    },
    closeBanner: function(){
        if( this.needsRefresh ){
            window.location.reload(true);
        }
    }
  }

  //See if cookie banner element exists
  const bannerEl = document.getElementById('ddbgdpr-banner')
  if( bannerEl ) {
    if(docCookies.getItem('__ddbcp') != 'true') {
        bannerEl.classList.add('ddbgdpr-banner--no-prefs');
        bannerEl.classList.add('ddbgdpr-banner--visible');
        document.getElementById('ddbgdpr-banner__toggle').checked = true;
    } else {
        document.getElementById('ddbgdpr-banner__toggle').checked = false;
    }

    //Execute function
    new obDDBGDPR(bannerEl);
  }



})(window, document, docCookies);