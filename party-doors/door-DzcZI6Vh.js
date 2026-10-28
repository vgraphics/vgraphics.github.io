var Zt=Object.defineProperty;var Jt=(t,e,i)=>e in t?Zt(t,e,{enumerable:!0,configurable:!0,writable:!0,value:i}):t[e]=i;var ee=(t,e,i)=>Jt(t,typeof e!="symbol"?e+"":e,i);var ge,m,mt,vt,V,Ie,bt,xt,xe,oe,B,yt,Ne,Te,je,wt,se={},pe=[],ei=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i,fe=Array.isArray;function C(t,e){for(var i in e)t[i]=e[i];return t}function Ve(t){t&&t.parentNode&&t.parentNode.removeChild(t)}function ti(t,e,i){var o,n,r,a={};for(r in e)r=="key"?o=e[r]:r=="ref"?n=e[r]:a[r]=e[r];if(arguments.length>2&&(a.children=arguments.length>3?ge.call(arguments,2):i),typeof t=="function"&&t.defaultProps!=null)for(r in t.defaultProps)a[r]===void 0&&(a[r]=t.defaultProps[r]);return re(t,a,o,n,null)}function re(t,e,i,o,n){var r={type:t,props:e,key:i,ref:o,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:n??++mt,__i:-1,__u:0};return n==null&&m.vnode!=null&&m.vnode(r),r}function K(t){return t.children}function W(t,e){this.props=t,this.context=e}function M(t,e){if(e==null)return t.__?M(t.__,t.__i+1):null;for(var i;e<t.__k.length;e++)if((i=t.__k[e])!=null&&i.__e!=null)return i.__e;return typeof t.type=="function"?M(t):null}function ii(t){if(t.__P&&t.__d){var e=t.__v,i=e.__e,o=[],n=[],r=C({},e);r.__v=e.__v+1,m.vnode&&m.vnode(r),Ee(t.__P,r,e,t.__n,t.__P.namespaceURI,32&e.__u?[i]:null,o,i??M(e),!!(32&e.__u),n),r.__v=e.__v,r.__.__k[r.__i]=r,zt(o,r,n),e.__e=e.__=null,r.__e!=i&&_t(r)}}function _t(t){if((t=t.__)!=null&&t.__c!=null)return t.__e=t.__c.base=null,t.__k.some(function(e){if(e!=null&&e.__e!=null)return t.__e=t.__c.base=e.__e}),_t(t)}function ze(t){(!t.__d&&(t.__d=!0)&&V.push(t)&&!le.__r++||Ie!=m.debounceRendering)&&((Ie=m.debounceRendering)||bt)(le)}function le(){try{for(var t,e=1;V.length;)V.length>e&&V.sort(xt),t=V.shift(),e=V.length,ii(t)}finally{V.length=le.__r=0}}function St(t,e,i,o,n,r,a,l,d,p,c){var h,s,k,v,S,x,w=o&&o.__k||pe,f=e.length;for(d=oi(i,e,w,d,f),h=0;h<f;h++)(k=i.__k[h])!=null&&(s=k.__i!=-1&&w[k.__i]||se,k.__i=h,x=Ee(t,k,s,n,r,a,l,d,p,c),v=k.__e,k.ref&&s.ref!=k.ref&&(s.ref&&Me(s.ref,null,k),c.push(k.ref,k.__c||v,k)),S==null&&v!=null&&(S=v),4&k.__u?(d=Tt(k,d,t),s.__e&&(s.__e=null)):typeof k.type=="function"&&x!==void 0?d=x:v&&(d=v.nextSibling),k.__u&=-7);return i.__e=S,d}function oi(t,e,i,o,n){var r,a,l,d,p,c=i.length,h=c,s=0;for(t.__k=new Array(n),r=0;r<n;r++)(a=e[r])!=null&&typeof a!="boolean"&&typeof a!="function"?(typeof a=="string"||typeof a=="number"||typeof a=="bigint"||a.constructor==String?a=t.__k[r]=re(null,a,null,null,null):fe(a)?a=t.__k[r]=re(K,{children:a},null,null,null):a.constructor===void 0&&a.__b>0?a=t.__k[r]=re(a.type,a.props,a.key,a.ref?a.ref:null,a.__v):t.__k[r]=a,d=r+s,a.__=t,a.__b=t.__b+1,l=null,(p=a.__i=ri(a,i,d,h))!=-1&&(h--,(l=i[p])&&(l.__u|=2)),l==null||l.__v==null?(p==-1&&(n>c?s--:n<c&&s++),typeof a.type!="function"&&(a.__u|=4)):p!=d&&(p==d-1?s--:p==d+1?s++:(p>d?s--:s++,a.__u|=4))):t.__k[r]=null;if(h)for(r=0;r<c;r++)(l=i[r])!=null&&(2&l.__u)==0&&(l.__e==o&&(o=M(l)),Qt(l,l));return o}function Tt(t,e,i){var o,n;if(typeof t.type=="function"){for(o=t.__k,n=0;o&&n<o.length;n++)o[n]&&(o[n].__=t,e=Tt(o[n],e,i));return e}t.__e!=e&&(e&&t.type&&!e.parentNode&&(e=M(t)),e=i.insertBefore(t.__e,e||null));do e=e&&e.nextSibling;while(e!=null&&e.nodeType==8);return e}function ri(t,e,i,o){var n,r,a,l=t.key,d=t.type,p=e[i],c=p!=null&&(2&p.__u)==0;if(p===null&&l==null||c&&l==p.key&&d==p.type)return i;if(o>(c?1:0)){for(n=i-1,r=i+1;n>=0||r<e.length;)if((p=e[a=n>=0?n--:r++])!=null&&(2&p.__u)==0&&l==p.key&&d==p.type)return a}return-1}function Ue(t,e,i){e[0]=="-"?t.setProperty(e,i??""):t[e]=i==null?"":typeof i!="number"||ei.test(e)?i:i+"px"}function te(t,e,i,o,n){var r,a;e:if(e=="style")if(typeof i=="string")t.style.cssText=i;else{if(typeof o=="string"&&(t.style.cssText=o=""),o)for(e in o)i&&e in i||Ue(t.style,e,"");if(i)for(e in i)o&&i[e]==o[e]||Ue(t.style,e,i[e])}else if(e[0]=="o"&&e[1]=="n")r=e!=(e=e.replace(yt,"$1")),a=e.toLowerCase(),e=a in t||e=="onFocusOut"||e=="onFocusIn"?a.slice(2):e.slice(2),t.l||(t.l={}),t.l[e+r]=i,i?o?i[B]=o[B]:(i[B]=Ne,t.addEventListener(e,r?je:Te,r)):t.removeEventListener(e,r?je:Te,r);else{if(n=="http://www.w3.org/2000/svg")e=e.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if(e!="width"&&e!="height"&&e!="href"&&e!="list"&&e!="form"&&e!="tabIndex"&&e!="download"&&e!="rowSpan"&&e!="colSpan"&&e!="role"&&e!="popover"&&e in t)try{t[e]=i??"";break e}catch{}typeof i=="function"||(i==null||i===!1&&e[4]!="-"?t.removeAttribute(e):t.setAttribute(e,e=="popover"&&i==1?"":i))}}function Ye(t){return function(e){if(this.l){var i=this.l[e.type+t];if(e[oe]==null)e[oe]=Ne++;else if(e[oe]<i[B])return;return i(m.event?m.event(e):e)}}}function Ee(t,e,i,o,n,r,a,l,d,p){var c,h,s,k,v,S,x,w,f,T,P,L,$,Y,g,N,z=e.type;if(e.constructor!==void 0)return null;128&i.__u&&(d=!!(32&i.__u),r=[l=e.__e=i.__e]),(c=m.__b)&&c(e);e:if(typeof z=="function"){h=a.length;try{if(f=e.props,T=z.prototype&&z.prototype.render,P=(c=z.contextType)&&o[c.__c],L=c?P?P.props.value:c.__:o,i.__c?w=(s=e.__c=i.__c).__=s.__E:(T?e.__c=s=new z(f,L):(e.__c=s=new W(f,L),s.constructor=z,s.render=ai),P&&P.sub(s),s.state||(s.state={}),s.__n=o,k=s.__d=!0,s.__h=[],s._sb=[]),T&&s.__s==null&&(s.__s=s.state),T&&z.getDerivedStateFromProps!=null&&(s.__s==s.state&&(s.__s=C({},s.__s)),C(s.__s,z.getDerivedStateFromProps(f,s.__s))),v=s.props,S=s.state,s.__v=e,k)T&&z.getDerivedStateFromProps==null&&s.componentWillMount!=null&&s.componentWillMount(),T&&s.componentDidMount!=null&&s.__h.push(s.componentDidMount);else{if(T&&z.getDerivedStateFromProps==null&&f!==v&&s.componentWillReceiveProps!=null&&s.componentWillReceiveProps(f,L),e.__v==i.__v||!s.__e&&s.shouldComponentUpdate!=null&&s.shouldComponentUpdate(f,s.__s,L)===!1){e.__v!=i.__v&&(s.props=f,s.state=s.__s,s.__d=!1),e.__e=i.__e,e.__k=i.__k,e.__k.some(function(R){R&&(R.__=e)}),pe.push.apply(s.__h,s._sb),s._sb=[],s.__h.length&&a.push(s),l=M(i);break e}s.componentWillUpdate!=null&&s.componentWillUpdate(f,s.__s,L),T&&s.componentDidUpdate!=null&&s.__h.push(function(){s.componentDidUpdate(v,S,x)})}if(s.context=L,s.props=f,s.__P=t,s.__e=!1,$=m.__r,Y=0,T)s.state=s.__s,s.__d=!1,$&&$(e),c=s.render(s.props,s.state,s.context),pe.push.apply(s.__h,s._sb),s._sb=[];else do s.__d=!1,$&&$(e),c=s.render(s.props,s.state,s.context),s.state=s.__s;while(s.__d&&++Y<25);s.state=s.__s,s.getChildContext!=null&&(o=C(C({},o),s.getChildContext())),T&&!k&&s.getSnapshotBeforeUpdate!=null&&(x=s.getSnapshotBeforeUpdate(v,S)),g=c!=null&&c.type===K&&c.key==null?Lt(c.props.children):c,l=St(t,fe(g)?g:[g],e,i,o,n,r,a,l,d,p),s.base=e.__e,e.__u&=-161,s.__h.length&&a.push(s),w&&(s.__E=s.__=null)}catch(R){if(a.length=h,e.__v=null,d||r!=null){if(R.then){for(e.__u|=d?160:128;l&&l.nodeType==8&&l.nextSibling;)l=l.nextSibling;r!=null&&(r[r.indexOf(l)]=null),e.__e=l}else if(r!=null)for(N=r.length;N--;)Ve(r[N])}else e.__e=i.__e;e.__k==null&&(e.__k=i.__k||[]),R.then||jt(e),m.__e(R,e,i)}}else r==null&&e.__v==i.__v?(e.__k=i.__k,e.__e=i.__e):l=e.__e=ni(i.__e,e,i,o,n,r,a,d,p);return(c=m.diffed)&&c(e),128&e.__u?void 0:l}function jt(t){t&&(t.__c&&(t.__c.__e=!0),t.__k&&t.__k.some(jt))}function zt(t,e,i){for(var o=0;o<i.length;o++)Me(i[o],i[++o],i[++o]);m.__c&&m.__c(e,t),t.some(function(n){try{t=n.__h,n.__h=[],t.some(function(r){r.call(n)})}catch(r){m.__e(r,n.__v)}})}function Lt(t){return typeof t!="object"||t==null||t.__b>0?t:fe(t)?t.map(Lt):t.constructor!==void 0?null:C({},t)}function ni(t,e,i,o,n,r,a,l,d){var p,c,h,s,k,v,S,x=i.props||se,w=e.props,f=e.type;if(f=="svg"?n="http://www.w3.org/2000/svg":f=="math"?n="http://www.w3.org/1998/Math/MathML":n||(n="http://www.w3.org/1999/xhtml"),r!=null){for(p=0;p<r.length;p++)if((k=r[p])&&"setAttribute"in k==!!f&&(f?k.localName==f:k.nodeType==3)){t=k,r[p]=null;break}}if(t==null){if(f==null)return document.createTextNode(w);t=document.createElementNS(n,f,w.is&&w),l&&(m.__m&&m.__m(e,r),l=!1),r=null}if(f==null)x===w||l&&t.data==w||(t.data=w);else{if(r=f=="textarea"&&w.defaultValue!=null?null:r&&ge.call(t.childNodes),!l&&r!=null)for(x={},p=0;p<t.attributes.length;p++)x[(k=t.attributes[p]).name]=k.value;for(p in x)k=x[p],p=="dangerouslySetInnerHTML"?h=k:p=="children"||p in w||p=="value"&&"defaultValue"in w||p=="checked"&&"defaultChecked"in w||te(t,p,null,k,n);for(p in w)k=w[p],p=="children"?s=k:p=="dangerouslySetInnerHTML"?c=k:p=="value"?v=k:p=="checked"?S=k:l&&typeof k!="function"||x[p]===k||te(t,p,k,x[p],n);if(c)l||h&&(c.__html==h.__html||c.__html==t.innerHTML)||(t.innerHTML=c.__html),e.__k=[];else if(h&&(t.innerHTML=""),St(e.type=="template"?t.content:t,fe(s)?s:[s],e,i,o,f=="foreignObject"?"http://www.w3.org/1999/xhtml":n,r,a,r?r[0]:i.__k&&M(i,0),l,d),r!=null)for(p=r.length;p--;)Ve(r[p]);l&&f!="textarea"||(p="value",f=="progress"&&v==null?t.removeAttribute("value"):v!=null&&(v!==t[p]||f=="progress"&&!v||f=="option"&&v!=x[p])&&te(t,p,v,x[p],n),p="checked",S!=null&&S!=t[p]&&te(t,p,S,x[p],n))}return t}function Me(t,e,i){try{if(typeof t=="function"){var o=typeof t.__u=="function";o&&t.__u(),o&&e==null||(t.__u=t(e))}else t.current=e}catch(n){m.__e(n,i)}}function Qt(t,e,i){var o,n;if(m.unmount&&m.unmount(t),(o=t.ref)&&(o.current&&o.current!=t.__e||Me(o,null,e)),(o=t.__c)!=null){if(o.componentWillUnmount)try{o.componentWillUnmount()}catch(r){m.__e(r,e)}o.base=o.__P=o.__n=null}if(o=t.__k)for(n=0;n<o.length;n++)o[n]&&Qt(o[n],e,i||typeof t.type!="function");i||Ve(t.__e),t.__c=t.__=t.__e=void 0}function ai(t,e,i){return this.constructor(t,i)}function fo(t,e,i){var o,n,r,a;e==document&&(e=document.documentElement),m.__&&m.__(t,e),n=(o=!1)?null:e.__k,r=[],a=[],Ee(e,t=e.__k=ti(K,null,[t]),n||se,se,e.namespaceURI,n?null:e.firstChild?ge.call(e.childNodes):null,r,n?n.__e:e.firstChild,o,a),zt(r,t,a),t.props.children=null}function si(t){function e(i){var o,n;return this.getChildContext||(o=new Set,(n={})[e.__c]=this,this.getChildContext=function(){return n},this.componentWillUnmount=function(){o=null},this.shouldComponentUpdate=function(r){this.props.value!=r.value&&o.forEach(function(a){a.__e=!0,ze(a)})},this.sub=function(r){o.add(r);var a=r.componentWillUnmount;r.componentWillUnmount=function(){o&&o.delete(r),a&&a.call(r)}}),i.children}return e.__c="__cC"+wt++,e.__=t,e.Provider=e.__l=(e.Consumer=function(i,o){return i.children(o)}).contextType=e,e}ge=pe.slice,m={__e:function(t,e,i,o){for(var n,r,a;e=e.__;)if((n=e.__c)&&!n.__)try{if((r=n.constructor)&&r.getDerivedStateFromError!=null&&(n.setState(r.getDerivedStateFromError(t)),a=n.__d),n.componentDidCatch!=null&&(n.componentDidCatch(t,o||{}),a=n.__d),a)return n.__E=n}catch(l){t=l}throw t}},mt=0,vt=function(t){return t!=null&&t.constructor===void 0},W.prototype.setState=function(t,e){var i;i=this.__s!=null&&this.__s!=this.state?this.__s:this.__s=C({},this.state),typeof t=="function"&&(t=t(C({},i),this.props)),t&&C(i,t),t!=null&&this.__v&&(e&&this._sb.push(e),ze(this))},W.prototype.forceUpdate=function(t){this.__v&&(this.__e=!0,t&&this.__h.push(t),ze(this))},W.prototype.render=K,V=[],bt=typeof Promise=="function"?Promise.prototype.then.bind(Promise.resolve()):setTimeout,xt=function(t,e){return t.__v.__b-e.__v.__b},le.__r=0,xe=Math.random().toString(8),oe="__d"+xe,B="__a"+xe,yt=/(PointerCapture)$|Capture$/i,Ne=0,Te=Ye(!1),je=Ye(!0),wt=0;var pi=0;function u(t,e,i,o,n,r){e||(e={});var a,l,d=e;if("ref"in d)for(l in d={},e)l=="ref"?a=e[l]:d[l]=e[l];var p={type:t,props:d,key:i,ref:a,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:--pi,__i:-1,__u:0,__source:n,__self:r};if(typeof t=="function"&&(a=t.defaultProps))for(l in a)d[l]===void 0&&(d[l]=a[l]);return m.vnode&&m.vnode(p),p}var F,y,ye,Be,ce=0,$t=[],_=m,We=_.__b,Ge=_.__r,qe=_.diffed,Xe=_.__c,Ke=_.unmount,Ze=_.__;function me(t,e){_.__h&&_.__h(y,t,ce||e),ce=0;var i=y.__H||(y.__H={__:[],__h:[]});return t>=i.__.length&&i.__.push({}),i.__[t]}function li(t){return ce=1,ci(At,t)}function ci(t,e,i){var o=me(F++,2);if(o.t=t,!o.__c&&(o.__=[At(void 0,e),function(l){var d=o.__N?o.__N[0]:o.__[0],p=o.t(d,l);d!==p&&(o.__N=[p,o.__[1]],o.__c.setState({}))}],o.__c=y,!y.__f)){var n=function(l,d,p){if(!o.__c.__H)return!0;var c=!1,h=o.__c.props!==l;if(o.__c.__H.__.some(function(k){if(k.__N){c=!0;var v=k.__[0];k.__=k.__N,k.__N=void 0,v!==k.__[0]&&(h=!0)}}),r){var s=r.call(this,l,d,p);return c?s||h:s}return!c||h};y.__f=!0;var r=y.shouldComponentUpdate,a=y.componentWillUpdate;y.componentWillUpdate=function(l,d,p){if(this.__e){var c=r;r=void 0,n(l,d,p),r=c}a&&a.call(this,l,d,p)},y.shouldComponentUpdate=n}return o.__N||o.__}function Ct(t,e){var i=me(F++,3);!_.__s&&Ht(i.__H,e)&&(i.__=t,i.u=e,y.__H.__h.push(i))}function di(t){return ce=5,Oe(function(){return{current:t}},[])}function Oe(t,e){var i=me(F++,7);return Ht(i.__H,e)&&(i.__=t(),i.__H=e,i.__h=t),i.__}function ki(t){var e=y.context[t.__c],i=me(F++,9);return i.c=t,e?(i.__==null&&(i.__=!0,e.sub(y)),e.props.value):t.__}function hi(){for(var t;t=$t.shift();){var e=t.__H;if(t.__P&&e)try{e.__h.some(ne),e.__h.some(Le),e.__h=[]}catch(i){e.__h=[],_.__e(i,t.__v)}}}_.__b=function(t){y=null,We&&We(t)},_.__=function(t,e){t&&e.__k&&e.__k.__m&&(t.__m=e.__k.__m),Ze&&Ze(t,e)},_.__r=function(t){Ge&&Ge(t),F=0;var e=(y=t.__c).__H;e&&(ye===y?(e.__h=[],y.__h=[],e.__.some(function(i){i.__N&&(i.__=i.__N),i.u=i.__N=void 0})):(e.__h.some(ne),e.__h.some(Le),e.__h=[],F=0)),ye=y},_.diffed=function(t){qe&&qe(t);var e=t.__c;e&&e.__H&&(e.__H.__h.length&&($t.push(e)!==1&&Be===_.requestAnimationFrame||((Be=_.requestAnimationFrame)||ui)(hi)),e.__H.__.some(function(i){i.u&&(i.__H=i.u,i.u=void 0)})),ye=y=null},_.__c=function(t,e){e.some(function(i){try{i.__h.some(ne),i.__h=i.__h.filter(function(o){return!o.__||Le(o)})}catch(o){e.some(function(n){n.__h&&(n.__h=[])}),e=[],_.__e(o,i.__v)}}),Xe&&Xe(t,e)},_.unmount=function(t){Ke&&Ke(t);var e,i=t.__c;i&&i.__H&&(i.__H.__.some(function(o){try{ne(o)}catch(n){e=n}}),i.__H=void 0,e&&_.__e(e,i.__v))};var Je=typeof requestAnimationFrame=="function";function ui(t){var e,i=function(){clearTimeout(o),Je&&cancelAnimationFrame(e),setTimeout(t)},o=setTimeout(i,35);Je&&(e=requestAnimationFrame(i))}function ne(t){var e=y,i=t.__c;typeof i=="function"&&(t.__c=void 0,i()),y=e}function Le(t){var e=y;t.__c=t.__(),y=e}function Ht(t,e){return!t||t.length!==e.length||e.some(function(i,o){return i!==t[o]})}function At(t,e){return typeof e=="function"?e(t):e}var gi=Symbol.for("preact-signals");function ve(){if(H>1)H--;else{var t,e=!1;for((function(){var n=ke;for(ke=void 0;n!==void 0;){var r=n.S;if(r.v===n.v)for(var a=r.t;a!==void 0;a=a.x)a.i===n.i&&(a.i=r.i);n=n.o}})();q!==void 0;){var i=q;for(q=void 0,de++;i!==void 0;){var o=i.u;if(i.u=void 0,i.f&=-3,!(8&i.f)&&Nt(i))try{i.c()}catch(n){e||(t=n,e=!0)}i=o}}if(de=0,H--,e)throw t}}function fi(t){if(H>0)return t();Qe=++mi,H++;try{return t()}finally{ve()}}var G,b=void 0;function be(t){var e=b,i=G;b=void 0,G=void 0;try{return t()}finally{b=e,G=i}}var q=void 0,H=0,de=0,mi=0,Qe=0,ke=void 0,he=0;function Pt(t){if(b!==void 0){var e=t.n;if(e===void 0||e.t!==b)return e={i:0,S:t,p:b.s,n:void 0,t:b,e:void 0,x:void 0,r:e},b.s!==void 0&&(b.s.n=e),b.s=e,t.n=e,32&b.f&&t.S(e),e;if(e.i===-1)return e.i=0,e.n!==void 0&&(e.n.p=e.p,e.p!==void 0&&(e.p.n=e.n),e.p=b.s,e.n=void 0,b.s.n=e,b.s=e),e}}function j(t,e){this.v=t,this.i=0,this.n=void 0,this.t=void 0,this.l=0,this.W=e==null?void 0:e.watched,this.Z=e==null?void 0:e.unwatched,this.name=e==null?void 0:e.name}j.prototype.brand=gi;j.prototype.h=function(){return!0};j.prototype.S=function(t){var e=this,i=this.t;i!==t&&t.e===void 0&&(t.x=i,this.t=t,i!==void 0?i.e=t:be(function(){var o;(o=e.W)==null||o.call(e)}))};j.prototype.U=function(t){var e=this;if(this.t!==void 0){var i=t.e,o=t.x;i!==void 0&&(i.x=o,t.e=void 0),o!==void 0&&(o.e=i,t.x=void 0),t===this.t&&(this.t=o,o===void 0&&be(function(){var n;(n=e.Z)==null||n.call(e)}))}};j.prototype.subscribe=function(t){var e=this;return Z(function(){var i=e.value;be(function(){return t(i)})},{name:"sub"})};j.prototype.valueOf=function(){return this.value};j.prototype.toString=function(){return this.value+""};j.prototype.toJSON=function(){return this.value};j.prototype.peek=function(){var t=this;return be(function(){return t.value})};Object.defineProperty(j.prototype,"value",{get:function(){var t=Pt(this);return t!==void 0&&(t.i=this.i),this.v},set:function(t){if(t!==this.v){if(de>100)throw new Error("Cycle detected");(function(i){H!==0&&de===0&&i.l!==Qe&&(i.l=Qe,ke={S:i,v:i.v,i:i.i,o:ke})})(this),this.v=t,this.i++,he++,H++;try{for(var e=this.t;e!==void 0;e=e.x)e.t.N()}finally{ve()}}}});function E(t,e){return new j(t,e)}function Nt(t){for(var e=t.s;e!==void 0;e=e.n)if(e.S.i!==e.i||!e.S.h()||e.S.i!==e.i)return!0;return!1}function Vt(t){for(var e=t.s;e!==void 0;e=e.n){var i=e.S.n;if(i!==void 0&&(e.r=i),e.S.n=e,e.i=-1,e.n===void 0){t.s=e;break}}}function Et(t){for(var e=t.s,i=void 0;e!==void 0;){var o=e.p;e.i===-1?(e.S.U(e),o!==void 0&&(o.n=e.n),e.n!==void 0&&(e.n.p=o)):i=e,e.S.n=e.r,e.r!==void 0&&(e.r=void 0),e=o}t.s=i}function O(t,e){j.call(this,void 0,e),this.x=t,this.s=void 0,this.g=he-1,this.f=4}O.prototype=new j;O.prototype.h=function(){if(this.f&=-3,1&this.f)return!1;if((36&this.f)==32||(this.f&=-5,this.g===he))return!0;if(this.g=he,this.f|=1,this.i>0&&!Nt(this))return this.f&=-2,!0;var t=b;try{Vt(this),b=this;var e=this.x();(16&this.f||this.v!==e||this.i===0)&&(this.v=e,this.f&=-17,this.i++)}catch(i){this.v=i,this.f|=16,this.i++}return b=t,Et(this),this.f&=-2,!0};O.prototype.S=function(t){if(this.t===void 0){this.f|=36;for(var e=this.s;e!==void 0;e=e.n)e.S.S(e)}j.prototype.S.call(this,t)};O.prototype.U=function(t){if(this.t!==void 0&&(j.prototype.U.call(this,t),this.t===void 0)){this.f&=-33;for(var e=this.s;e!==void 0;e=e.n)e.S.U(e)}};O.prototype.N=function(){if(!(2&this.f)){this.f|=6;for(var t=this.t;t!==void 0;t=t.x)t.t.N()}};Object.defineProperty(O.prototype,"value",{get:function(){if(1&this.f)throw new Error("Cycle detected");var t=Pt(this);if(this.h(),t!==void 0&&(t.i=this.i),16&this.f)throw this.v;return this.v}});function $e(t,e){return new O(t,e)}function Mt(t){var e=t.m;if(t.m=void 0,typeof e=="function"){H++;var i=b;b=void 0;try{e()}catch(o){throw t.f&=-2,t.f|=8,Re(t),o}finally{b=i,ve()}}}function Re(t){for(var e=t.s;e!==void 0;e=e.n)e.S.U(e);t.x=void 0,t.s=void 0,Mt(t)}function vi(t){if(b!==this)throw new Error("Out-of-order effect");Et(this),b=t,this.f&=-2,8&this.f&&Re(this),ve()}function I(t,e){this.x=t,this.m=void 0,this.s=void 0,this.u=void 0,this.f=32,this.name=e==null?void 0:e.name,G&&G.push(this)}I.prototype.c=function(){var t=this.S();try{if(8&this.f||this.x===void 0)return;var e=this.x();typeof e=="function"&&(this.m=e)}finally{t()}};I.prototype.S=function(){if(1&this.f)throw new Error("Cycle detected");this.f|=1,this.f&=-9,Mt(this),Vt(this),H++;var t=b;return b=this,vi.bind(this,t)};I.prototype.N=function(){2&this.f||(this.f|=2,this.u=q,q=this)};I.prototype.d=function(){this.f|=8,1&this.f||Re(this)};I.prototype.dispose=function(){this.d()};function Z(t,e){var i=new I(t,e);try{i.c()}catch(n){throw i.d(),n}var o=i.d.bind(i);return o[Symbol.dispose]=o,o}var Ot,ie,bi=typeof window<"u"&&!!window.__PREACT_SIGNALS_DEVTOOLS__,Rt=[];Z(function(){Ot=this.N})();function U(t,e){m[t]=e.bind(null,m[t]||function(){})}function X(t){if(ie){var e=ie;ie=void 0,e()}ie=t&&t.S()}function Dt(t){var e=this,i=t.data,o=yi(i);o.name="ReactiveDom",o.value=i;var n=Oe(function(){for(var l=e,d=e.__v;d=d.__;)if(d.__c){d.__c.__$f|=4;break}var p=$e(function(){var k=o.value.value;return k===0?0:k===!0?"":k||""}),c=$e(function(){return!Array.isArray(p.value)&&!vt(p.value)}),h=Z(function(){if(this.N=Ft,c.value){var k=p.value;l.__v&&l.__v.__e&&l.__v.__e.nodeType===3&&(l.__v.__e.data=k)}}),s=e.__$u.d;return e.__$u.d=function(){h(),s.call(this)},[c,p]},[]),r=n[0],a=n[1];return r.value?a.peek():a.value}Dt.displayName="ReactiveTextNode";Object.defineProperties(j.prototype,{constructor:{configurable:!0,value:void 0},type:{configurable:!0,value:Dt},props:{configurable:!0,get:function(){var t=this;return{data:{get value(){return t.value}}}}},__b:{configurable:!0,value:1}});U("__b",function(t,e){if(X(),typeof e.type=="string"){var i,o=e.props;for(var n in o)if(n!=="children"){var r=o[n];r instanceof j&&(i||(e.__np=i={}),i[n]=r,o[n]=r.peek())}}t(e)});U("__r",function(t,e){if(t(e),e.type!==K){X();var i,o=e.__c;o&&(o.__$f&=-2,(i=o.__$u)===void 0&&(o.__$u=i=(function(n,r){var a;return Z(function(){a=this},{name:r}),a.c=n,a})((function(n){return function(){var r;bi&&((r=this.y)==null||r.call(this)),n.__$f|=1,n.setState({})}})(o),typeof e.type=="function"?e.type.displayName||e.type.name:""))),X(i)}});U("__e",function(t,e,i,o){X(),t(e,i,o)});U("diffed",function(t,e){X();var i;if(typeof e.type=="string"&&(i=e.__e)){var o=e.__np,n=e.props,r=i.U;if(r)for(var a in r){var l=r[a];l===void 0||o&&a in o||(l.d(),r[a]=void 0)}if(o){r||(r={},i.U=r);for(var d in o){var p=r[d],c=o[d];p===void 0?(p=xi(i,d,c,n),r[d]=p):p.o(c,n)}}}t(e)});function xi(t,e,i,o){var n=e in t&&t.ownerSVGElement===void 0,r=E(i);return{o:function(a,l){r.value=a,o=l},d:Z(function(){this.N=Ft;var a=r.value.value;o[e]!==a&&(o[e]=a,n?t[e]=a:a!=null&&(a!==!1||e[4]==="-")?t.setAttribute(e,a):t.removeAttribute(e))})}}U("unmount",function(t,e){if(typeof e.type=="string"){var i=e.__e;if(i){var o=i.U;if(o){i.U=void 0;for(var n in o){var r=o[n];r&&r.d()}}}var a=e.__np;if(a){var l=e.props;for(var d in a)l[d]=a[d]}e.__np=void 0}else{var p=e.__c;if(p){p.__$f|=8;var c=p.__$u;c&&(p.__$u=void 0,c.d())}}t(e)});U("__h",function(t,e,i,o){o<3&&(e.__$f|=2),t(e,i,o)});W.prototype.shouldComponentUpdate=function(t,e){if(this.__R)return!0;var i=this.__$u,o=i&&i.s!==void 0;for(var n in e)return!0;if(this.__f||typeof this.u=="boolean"&&this.u===!0){var r=2&this.__$f;if(!(o||r||4&this.__$f)||1&this.__$f)return!0}else if(!(o||4&this.__$f)||3&this.__$f)return!0;for(var a in t)if(a!=="__source"&&t[a]!==this.props[a])return!0;for(var l in this.props)if(!(l in t))return!0;return!1};function yi(t,e){return Oe(function(){return E(t,e)},[])}var wi=function(t){queueMicrotask(function(){queueMicrotask(t)})};function _i(){fi(function(){for(var t;t=Rt.shift();)Ot.call(t)})}function Ft(){Rt.push(this)===1&&(m.requestAnimationFrame||wi)(_i)}const Ce={lang:"vg.party.lang",tvStage:"vg.party.tvStage"};function Si(t,e){return`vg.party.${t}.${e}`}function De(){try{return typeof localStorage>"u"?null:localStorage}catch{return null}}function ae(t){const e=De();if(!e)return null;try{const i=e.getItem(t);return i===null?null:JSON.parse(i)}catch{return null}}function we(t,e){var i;try{(i=De())==null||i.setItem(t,JSON.stringify(e))}catch{}}function Ti(t){var e;try{(e=De())==null||e.removeItem(t)}catch{}}function ji(t,e){typeof window>"u"||window.addEventListener("storage",i=>{const o=i;if(o.key!==t())return;let n=null;try{n=o.newValue===null?null:JSON.parse(o.newValue)}catch{}e(n)})}const zi=[.875,1,1.125,1.25,1.5],et=(t,e)=>Object.prototype.hasOwnProperty.call(t,e),_e=(t,e)=>Object.is(t,e)||JSON.stringify(t)===JSON.stringify(e),D=t=>typeof t=="boolean",Li=t=>t==="el"||t==="en",Qi=t=>typeof t=="number"&&zi.includes(t),$i=t=>t==="system"||t==="calm",Se=t=>typeof t=="number"&&Number.isFinite(t)&&t>=0&&t<=1,Ci=t=>typeof t=="object"&&t!==null&&Se(t.music)&&Se(t.voice)&&Se(t.effects),Hi={music:1,voice:1,effects:1};function Ai(){let t=null,e=null,i=null,o=!1;const n=[];let r=null;const a=c=>e!==null&&!c.local&&t!==null&&c.game()===t;function l(){if(e===null||!o)return;const c=e.values,h={};for(const s of n){if(!a(s)||et(c,s.key))continue;const k=s.chosen();k!==void 0&&(h[s.key]=k)}e.fill(h)}function d(c,h,s,k={}){const v=k.game??null,S=k.legacy??`vg.party.${c}`,x=k.legacy??(v===null?S:null),w=new Set,f=()=>v??t,T=()=>{const g=f();return g!==null?Si(g,c):S},P=()=>{const g=T(),N=ae(g);if(s(N))return N;if(x!==null&&x!==g){const z=ae(x);if(s(z))return we(g,z),z}return h};let L=P();const $=g=>{if(!_e(g,L)){L=g;for(const N of[...w])N(g)}},Y={key:c,local:k.local===!0,game:f,deviceKey:T,chosen(){const g=ae(T());return s(g)&&!_e(g,h)?g:void 0},bind:()=>$(P()),take(g){!s(g)||_e(g,L)||(we(T(),g),$(g))}};return n.push(Y),ji(T,g=>$(s(g)?g:h)),{get:()=>L,set(g){we(T(),g),$(g),e!==null&&a(Y)&&(e.set({[c]:g}),l())},watch(g){return w.add(g),()=>{w.delete(g)}}}}function p(c,h){for(const s of n)!a(s)||h!==void 0&&!h.includes(s.key)||!et(c,s.key)||s.take(c[s.key])}return{setting:d,kitSettings(){return r??(r={language:d("language",null,Li,{legacy:Ce.lang}),music:d("music",!0,D),sounds:d("sounds",!0,D),voice:d("voice",!0,D),vibration:d("vibration",!0,D),gamePicture:d("gamePicture",!1,D),textScale:d("textScale",1,Qi),motion:d("motion","system",$i),captions:d("captions",!1,D),loudness:d("loudness",Hi,Ci,{local:!0})}),r},name(c){if(t!==c){t=c;for(const h of n)h.bind();e!==null&&(p(e.values),l())}},sync(c){i==null||i(),e=c,o=!1;let h=!0;p(c.values);const s=c.watch((v,S,x)=>{h&&(p(v,S),x==="vhub"&&l())});c.ready().then(()=>{h&&(o=!0,p(c.values),l())},()=>{});const k=()=>{h&&(h=!1,s(),e===c&&(e=null,i=null,o=!1))};return i=k,k}}}const Pi=Ai(),Q=Pi.kitSettings(),A={language:Q.language,music:Q.music,sounds:Q.sounds,voice:Q.voice,vibration:Q.vibration,gamePicture:Q.gamePicture,textScale:Q.textScale,motion:Q.motion,captions:Q.captions};Q.gamePicture;Q.loudness;const mo="pk-sr",It=E(A.textScale.get());A.textScale.watch(t=>{It.value=t});const Ut=E(A.motion.get());A.motion.watch(t=>{Ut.value=t});const He=E(!1);var ft;if(typeof window<"u"&&typeof window.matchMedia=="function"){const t=window.matchMedia("(prefers-reduced-motion: reduce)");He.value=t.matches,(ft=t.addEventListener)==null||ft.call(t,"change",e=>{He.value=e.matches})}const Ni=$e(()=>Ut.value==="calm"||He.value),Vi=E(A.captions.get());A.captions.watch(t=>{Vi.value=t});let tt=!1;function Ei(){tt||(tt=!0,typeof Object.hasOwn!="function"&&Object.defineProperty(Object,"hasOwn",{value:(t,e)=>Object.prototype.hasOwnProperty.call(t,e),configurable:!0,writable:!0}))}const Mi=["el","en"],Oi={"kit.next":"Συνέχεια","kit.done":"Έτοιμο","kit.cancel":"Άκυρο","kit.close":"Κλείσιμο","kit.save":"Αποθήκευση","kit.on":"Ναι","kit.off":"Όχι","kit.less":"Λιγότερο","kit.more":"Περισσότερο","kit.paused":"Παύση από τον οικοδεσπότη","kit.reconnecting":"Επανασύνδεση…","kit.players":"Παίκτες","kit.captions":"Τα λόγια της αφήγησης","kit.time.seconds":"{n} δευτ.","kit.time.minutes":"{n, plural, one {# λεπτό} other {# λεπτά}}","kit.time.minutesSeconds":"{m, plural, one {# λεπτό} other {# λεπτά}} {s} δευτ.","kit.timer.left":"Απομένουν {time}","kit.timer.paused":"Σε παύση, απομένουν {time}","kit.input.invalid":"Αυτό δεν μέτρησε. Δοκίμασε ξανά.","kit.input.step":"Πολύ αργά: αυτό το κομμάτι τελείωσε.","kit.input.late":"Πολύ αργά: ο χρόνος τελείωσε.","kit.input.paused":"Ο οικοδεσπότης έβαλε το παιχνίδι σε παύση.","kit.input.over":"Το παιχνίδι τελείωσε.","kit.join.title":"Μπες στο παιχνίδι","kit.join.codeLabel":"Κωδικός δωματίου","kit.join.codeHelp":"Τα έξι ψηφία στην τηλεόραση ή στο κινητό του οικοδεσπότη.","kit.join.year":"Έτος γέννησης","kit.join.yearFormat":"ΕΕΕΕ","kit.join.yearKept":"Κρατάμε μόνο την ηλικιακή ομάδα, ποτέ το έτος.","kit.join.yearWrong":"Γράψε το έτος με τέσσερα ψηφία.","kit.join.under":"Τα παιχνίδια αυτά είναι για ηλικίες 13 και πάνω.","kit.join.room":"Δωμάτιο {code}","kit.join.changeCode":"Αλλαγή","kit.join.vhubName":"Το όνομά σου στο VHub","kit.join.nickname":"Το όνομά σου σε αυτό το δωμάτιο","kit.join.nicknameHelp":"Από 2 έως 16 γράμματα ή ψηφία. Το βλέπει μόνο αυτό το δωμάτιο.","kit.join.avatar":"Η εικόνα σου","kit.join.avatarN":"Εικόνα {n}","kit.join.join":"Μπες","kit.join.joining":"Μπαίνεις…","kit.join.watch":"Μόνο παρακολούθηση","kit.join.code":"Δεν υπάρχει δωμάτιο με αυτόν τον κωδικό. Κοίτα την τηλεόραση και δοκίμασε ξανά.","kit.join.gone":"Αυτό το δωμάτιο έκλεισε.","kit.join.locked":"Το δωμάτιο είναι κλειδωμένο. Ζήτα από τον οικοδεσπότη να το ανοίξει.","kit.join.full":"Το δωμάτιο είναι γεμάτο.","kit.join.started":"Το παιχνίδι έχει ξεκινήσει και το δωμάτιο δεν δέχεται θεατές.","kit.join.kicked":"Ο οικοδεσπότης σε αφαίρεσε από το δωμάτιο.","kit.join.limited":"Πάρα πολλοί λάθος κωδικοί. Δοκίμασε ξανά σε λίγο.","kit.watching.started":"Το παιχνίδι είχε ήδη ξεκινήσει, οπότε παρακολουθείς. Θα παίξεις στο επόμενο.","kit.watching.full":"Οι θέσεις ήταν γεμάτες, οπότε παρακολουθείς.","kit.display.full":"Το δωμάτιο έχει ήδη τέσσερις οθόνες.","kit.display.demoFull":"Αυτή η δοκιμαστική παρτίδα έχει ήδη δύο οθόνες.","kit.display.key":"Δεν υπάρχει δωμάτιο με αυτόν τον κωδικό τηλεόρασης. Δες το «Στην τηλεόραση» στο κινητό του οικοδεσπότη και δοκίμασε ξανά.","kit.pair.code":"Καμία οθόνη δεν δείχνει τώρα αυτόν τον κωδικό. Κοίτα τον κωδικό στην τηλεόραση και δοκίμασε ξανά.","kit.limit.pairs":"Αυτή η οθόνη ζήτησε πάρα πολλούς κωδικούς. Δοκίμασε ξανά σε λίγο.","kit.limit.codes":"Πάρα πολλοί λάθος κωδικοί από αυτή τη συσκευή. Δοκίμασε ξανά σε μία ώρα.","kit.net.failed":"Κάτι δεν πήγε καλά. Έλεγξε τη σύνδεσή σου και δοκίμασε ξανά.","kit.room.closed":"Αυτό το δωμάτιο έκλεισε.","kit.room.notNow":"Όχι αυτή τη στιγμή.","kit.room.notMember":"Δεν είσαι πια σε αυτό το δωμάτιο.","kit.host.only":"Αυτό μπορεί να το κάνει μόνο ο οικοδεσπότης.","kit.host.tools":"Οικοδεσπότης","kit.host.pause":"Παύση","kit.host.resume":"Συνέχεια","kit.host.paused":"Σε παύση","kit.start.host":"Για να ξεκινήσει, ο οικοδεσπότης πρέπει να είναι παίκτης.","kit.start.rules":"Με αυτούς τους κανόνες δεν μπορεί να ξεκινήσει ακόμη το παιχνίδι.","kit.name.short":"Τουλάχιστον 2 γράμματα.","kit.name.long":"Έως 16 γράμματα.","kit.name.chars":"Μόνο γράμματα, ψηφία, κενά και . - _ '","kit.name.rude":"Αυτό το όνομα δεν επιτρέπεται. Δοκίμασε άλλο.","kit.rules.title":"Κανόνες","kit.rules.preset":"Έτοιμοι κανόνες","kit.rules.custom":"Προσαρμοσμένοι","kit.rules.noLimit":"Χωρίς όριο χρόνου","kit.rules.auto":"Αυτόματο","kit.rules.balance":"Ισορροπία","kit.rules.saveMine":"Αποθήκευση ως «Οι κανόνες μου»","kit.rules.card":"Κανόνες","kit.rules.changed":"άλλαξε","kit.rules.lang":"Γλώσσα δωματίου","kit.rules.narrator":"Αφήγηση","kit.rules.narrator.help":"Χωρίς αφήγηση μένουν οι υπότιτλοι και οι ήχοι.","kit.rules.relaxed":"Χαλαροί χρόνοι","kit.rules.relaxed.help":"Κάθε χρονικό όριο γίνεται μιάμιση φορά μεγαλύτερο.","kit.rules.tooFew":"{min, plural, one {Χρειάζεται τουλάχιστον # παίκτης.} other {Χρειάζονται τουλάχιστον # παίκτες.}}","kit.rules.tooMany":"{max, plural, one {Μπορεί να παίξει έως # παίκτης.} other {Μπορούν να παίξουν έως # παίκτες.}}","kit.status.host":"Οικοδεσπότης","kit.status.out":"Εκτός","kit.status.offline":"Χωρίς σύνδεση","kit.status.ready":"Έτοιμος/η","kit.status.level":"Επίπεδο","kit.progress.title":"Η πρόοδός σου","kit.progress.waiting":"Μετράμε τα XP σου…","kit.progress.gained":"+{xp, number} XP","kit.progress.coins":"+{coins, number} νομίσματα","kit.progress.none":"Κανένα νέο XP σε αυτό το παιχνίδι","kit.progress.capped":"Πήρες όλα τα σημερινά XP από αυτό το παιχνίδι. Κι άλλα αύριο.","kit.progress.level":"Επίπεδο {level}","kit.progress.levelUp":"Ανέβηκες επίπεδο!","kit.progress.bar":"Επίπεδο {level}: {into, number} από {needed, number} XP","kit.progress.toNext":"{n, number} XP ως το επίπεδο {next}","kit.progress.unlocked":"{n, plural, one {Νέο επίτευγμα} other {# νέα επιτεύγματα}}","kit.progress.achievement":"Νέο επίτευγμα","kit.progress.tier.bronze":"Χάλκινο","kit.progress.tier.silver":"Ασημένιο","kit.progress.tier.gold":"Χρυσό","kit.progress.keep":"Συνδέσου για να κρατήσεις τα XP σου","kit.progress.keepHelp":"Παίζεις ως επισκέπτης, οπότε τα XP σου μένουν σε αυτό το κινητό. Συνδέσου με Google για να τα έχεις σε κάθε συσκευή.","kit.progress.earn":"Συνδέσου για να κερδίζεις XP","kit.progress.earnHelp":"Με λογαριασμό VHub, κάθε παιχνίδι σού δίνει XP, επίπεδα και επιτεύγματα.","kit.progress.signIn":"Σύνδεση","ach.vhub.room-regular":"Θαμώνας","ach.vhub.room-regular.about":"Παίξε 10 παιχνίδια σε δωμάτια, σε όποιο παιχνίδι θέλεις.","ach.vhub.champion":"Νίκες παντού","ach.vhub.champion.about":"Κέρδισε σε δωμάτιο σε δύο διαφορετικά παιχνίδια.","ach.vhub.level-10":"Επίπεδο 10","ach.vhub.level-10.about":"Φτάσε στο επίπεδο 10 του VHub.","ach.vhub.level-25":"Επίπεδο 25","ach.vhub.level-25.about":"Φτάσε στο επίπεδο 25 του VHub.","ach.vhub.level-50":"Επίπεδο 50","ach.vhub.level-50.about":"Φτάσε στο επίπεδο 50 του VHub.","ach.vhub.level-100":"Επίπεδο 100","ach.vhub.level-100.about":"Φτάσε στο επίπεδο 100 του VHub.","kit.tv.qr":"Κωδικός QR για να μπεις στο δωμάτιο","kit.tv.joinHelp":"Στρέψε την κάμερα του κινητού στον κωδικό, ή άνοιξε τη σελίδα και γράψε τα έξι ψηφία.","kit.tv.sound":"Πάτησε OK για ήχο","kit.tv.leave":"Να βγει αυτή η τηλεόραση από το δωμάτιο;","kit.tv.stay":"Μένουμε","kit.tv.leaveYes":"Έξοδος","kit.tv.title":"Δείξε το στην τηλεόραση","kit.tv.step1":"Στην τηλεόραση, άνοιξε το πρόγραμμα περιήγησης και πήγαινε στο {site}.","kit.tv.step2":"Γράψε τον κωδικό τηλεόρασης {code} με το τηλεχειριστήριο.","kit.tv.link":"Ή άνοιξε αυτόν τον σύνδεσμο στην οθόνη, για παράδειγμα σε ένα λάπτοπ:","kit.tv.copied":"Ο σύνδεσμος αντιγράφηκε. Άνοιξέ τον στο πρόγραμμα περιήγησης της οθόνης.","kit.tv.noMirror":"Μην προβάλλεις την οθόνη του κινητού σου στην τηλεόραση: θα έβλεπαν όλοι τα μυστικά σου.","kit.tv.tableMode":"Χωρίς τηλεόραση; Το κινητό σου γίνεται το τραπέζι","kit.tv.joinAt":"Μπες από το","kit.tv.roomCode":"Κωδικός δωματίου","kit.tv.howTo":"Πώς παίζεται","kit.tv.freeSeat":"Ελεύθερη θέση","kit.tv.faceDown":"Η κάρτα μένει κλειστή","kit.tv.awards":"Βραβεία","kit.tvCode.label":"Κωδικός τηλεόρασης","kit.tvCode.keypad":"Πλήκτρα αριθμών","kit.tvCode.delete":"Διαγραφή","kit.tvCode.ok":"OK","kit.tvPair.qr":"Κωδικός QR που ανοίγει τη δοκιμαστική παρτίδα στο κινητό σου","kit.tvPair.code":"Κωδικός παρτίδας","kit.tvPair.help":"Σκάναρε το QR με την κάμερα του κινητού σου, ή γράψε τον κωδικό στη δοκιμαστική παρτίδα.","kit.tvHelp.type":"Στην τηλεόραση, άνοιξε το {site} στο πρόγραμμα περιήγησης και γράψε αυτόν τον κωδικό τηλεόρασης με το τηλεχειριστήριο:","kit.tvHelp.or":"ή γράψε τον στο {site}","kit.tvHelp.link":"Ή άνοιξε αυτόν τον σύνδεσμο στην τηλεόραση ή σε υπολογιστή:","kit.tvHelp.share":"Κοινοποίηση συνδέσμου","kit.tvHelp.copied":"Ο σύνδεσμος αντιγράφηκε","kit.tvHelp.again":"Έκλεισε η τηλεόραση; Άνοιξε ξανά τον ίδιο σύνδεσμο ή γράψε ξανά τον ίδιο κωδικό: ξαναμπαίνει σε αυτό το δωμάτιο.","kit.tvHelp.join":"οι άλλοι μπαίνουν από το {site}","kit.tvHelp.showing":"Η τηλεόραση δείχνει κωδικό; Γράψ' τον εδώ:","kit.tvHelp.connect":"Σύνδεση","kit.tvHelp.paired":"Η τηλεόρασή σου μπαίνει.","kit.lobby.needMore":"{n, plural, one {Περιμένουμε ακόμη # παίκτη} other {Περιμένουμε ακόμη # παίκτες}}","kit.lobby.waitingHost":"Περιμένουμε την έναρξη · οικοδεσπότης: {name}","kit.lobby.seats":"Παίκτες: {n} από {min}","kit.lobby.watchingCount":"{n, plural, one {# παρακολουθεί} other {# παρακολουθούν}}","kit.lobby.copied":"Ο σύνδεσμος αντιγράφηκε. Επικόλλησέ τον σε ένα μήνυμα.","kit.lobby.inviteLink":"Στείλε αυτόν τον σύνδεσμο: {link}","kit.lobby.rename":"Αλλαγή ονόματος","kit.lobby.ready":"Έτοιμος/η","kit.lobby.getReady":"Είμαι έτοιμος/η","kit.lobby.play":"Θέλω να παίξω","kit.lobby.watching":"Παρακολουθείς αυτό το παιχνίδι.","kit.lobby.start":"Έναρξη","kit.lobby.rules":"Κανόνες","kit.lobby.invite":"Πρόσκληση","kit.lobby.tv":"Στην τηλεόραση","kit.lobby.lock":"Κλείδωμα","kit.lobby.locked":"Κλειδωμένο","kit.lobby.kickTitle":"Αφαίρεση από το δωμάτιο;","kit.lobby.kick":"Αφαίρεση","kit.invite.title":"Έλα να παίξουμε","kit.invite.text":"Μπες στο δωμάτιό μου: κωδικός {code}","kit.invite.send":"Στείλε στους φίλους σου αυτόν τον σύνδεσμο","kit.invite.copy":"Αντιγραφή συνδέσμου","kit.invite.scan":"Ή σκανάρουν αυτόν τον κωδικό με την κάμερα του κινητού τους.","kit.consent.title":"Επιλογή απορρήτου","kit.consent.text":"Μας επιτρέπεις να μετράμε πώς παίζεται το παιχνίδι (με το Google Analytics), για να διορθώνουμε προβλήματα και να το κάνουμε καλύτερο;","kit.consent.privacy":"Πολιτική απορρήτου","kit.consent.deny":"Δεν επιτρέπω","kit.consent.allow":"Επιτρέπω","kit.ads.label":"Διαφήμιση","kit.ads.test":"Δοκιμαστική διαφήμιση","kit.ads.tvPlaying":"Η τηλεόραση δείχνει μια σύντομη διαφήμιση. Μπορείς να ξεκινήσεις μόλις τελειώσει.","kit.ads.off":"Αυτό το δωμάτιο δεν δείχνει διαφημίσεις.","kit.pass.thanks":"Χωρίς διαφημίσεις απόψε, χάρη στο Host Pass του/της {name}","kit.pass.nudgeTitle":"Ξεφορτώσου τις διαφημίσεις για πάντα","kit.pass.nudgeBody":"Host Pass · {price} εφάπαξ","kit.pass.nudgeLines":`Χωρίς διαφημίσεις στα κινητά των δωματίων σου
Χωρίς βίντεο στην τηλεόραση ανάμεσα στα παιχνίδια
Πληρώνεις μία φορά και ισχύει σε κάθε δωμάτιο που ανοίγεις`,"kit.pass.see":"Δες το Host Pass","kit.pass.notNow":"Όχι τώρα","kit.store.title":"Κατάστημα","kit.store.balance":"Τα νομίσματά σου: {coins, number}","kit.store.tabs":"Ενότητες του καταστήματος","kit.store.sets":"Σετ","kit.store.looks":"Στυλ","kit.store.pass":"Host Pass","kit.store.empty":"Έρχονται νέα στυλ.","kit.store.worth":"Αξίζει {coins, number} νομίσματα αν τα πάρεις ένα-ένα","kit.store.coinPrice":"{coins, number} νομίσματα","kit.store.inPacks":"{euro} σε πακέτα νομισμάτων","kit.store.buy":"Αγορά","kit.store.yours":"Δικό σου","kit.store.equip":"Φόρεσέ το","kit.store.unequip":"Βγάλε το","kit.store.short":"Λείπουν {n, number} νομίσματα","kit.store.partOwned":"Έχεις ήδη μερικά από αυτά. Πάρε τα υπόλοιπα ένα-ένα.","kit.store.askHost":"Ρώτα όποιον οργανώνει τη βραδιά","kit.store.signIn":"Συνδέσου για να αγοράσεις","kit.store.signInHelp":"Τα στυλ ανήκουν στον λογαριασμό σου στο VHub, οπότε σε ακολουθούν σε κάθε συσκευή.","kit.store.holds":"Τι περιλαμβάνει","kit.store.slot.portrait":"Πορτρέτο","kit.store.slot.seal":"Κέρινη σφραγίδα","kit.store.slot.cardBack":"Πλάτη κάρτας","kit.store.slot.plate":"Πινακίδα ονόματος","kit.hold.see":"Κράτα πατημένο για να δεις","kit.hold.screenReader":"Ο αναγνώστης οθόνης διαβάζει την κάρτα φωναχτά: φόρεσε ακουστικά.","kit.secret.title":"Μυστικές ενέργειες","kit.secret.none":"Καμία μυστική ενέργεια τώρα.","kit.secret.hold":"Κράτα πατημένο για να ανοίξει. Το έχουν όλα τα κινητά.","kit.phone.keepOn":"Κράτα την οθόνη ανοιχτή στο παιχνίδι, αλλιώς το κινητό μπορεί να αποσυνδεθεί.","kit.phone.views":"Προβολές","kit.phone.you":"Εσύ","kit.phone.table":"Τραπέζι","kit.phone.room":"Δωμάτιο","kit.phone.menu":"Μενού","kit.account.signIn":"Σύνδεση στο VHub","kit.account.yours":"Ο λογαριασμός σου στο VHub","kit.account.yoursLevel":"Ο λογαριασμός σου στο VHub, επίπεδο {level}","kit.connection.online":"Συνδεδεμένο","kit.connection.reconnecting":"Επανασύνδεση","kit.connection.offline":"Χωρίς σύνδεση","kit.menu.title":"Ρυθμίσεις","kit.menu.gamePicture":"Η εικόνα του χαρακτήρα μου αντί για του VHub","kit.menu.roomHelp":"Οι άλλοι μπαίνουν με αυτόν τον κωδικό.","kit.menu.language":"Γλώσσα σε αυτό το κινητό","kit.menu.music":"Μουσική","kit.menu.sounds":"Ηχητικά εφέ","kit.menu.voice":"Φωνή αφηγητή","kit.menu.vibration":"Δόνηση","kit.menu.musicLevel":"Ένταση μουσικής","kit.menu.soundsLevel":"Ένταση ηχητικών εφέ","kit.menu.voiceLevel":"Ένταση αφηγητή","kit.menu.soundHelp":"Για το κινητό που παίζει τον ήχο του δωματίου, όταν δεν υπάρχει τηλεόραση.","kit.menu.textSize":"Μέγεθος κειμένου","kit.menu.captions":"Τα λόγια της αφήγησης σε αυτό το κινητό","kit.menu.calm":"Λιγότερη κίνηση","kit.menu.analytics":"Βοήθησε να γίνει καλύτερο το παιχνίδι (Google Analytics)","kit.menu.adChoices":"Επιλογές διαφημίσεων","kit.menu.leaveSure":"Να φύγεις από το δωμάτιο; Μπορείς να ξαναμπείς με τον κωδικό.","kit.menu.leave":"Αποχώρηση","kit.legal.rights":"Με επιφύλαξη παντός δικαιώματος","kit.legal.gemi":"Αρ. Γ.Ε.ΜΗ. 181823306000","kit.legal.vat":"ΑΦΜ EL802736373","kit.legal.company":"Εταιρεία","kit.legal.privacy":"Απόρρητο","kit.legal.terms":"Όροι χρήσης"},Ri={"kit.next":"Next","kit.done":"Done","kit.cancel":"Cancel","kit.close":"Close","kit.save":"Save","kit.on":"On","kit.off":"Off","kit.less":"Less","kit.more":"More","kit.paused":"Paused by the host","kit.reconnecting":"Reconnecting…","kit.players":"Players","kit.captions":"The narrator's words","kit.time.seconds":"{n} s","kit.time.minutes":"{n, plural, other {# min}}","kit.time.minutesSeconds":"{m, plural, other {# min}} {s} s","kit.timer.left":"{time} left","kit.timer.paused":"Paused, {time} left","kit.input.invalid":"That didn't count. Try again.","kit.input.step":"Too late: that part is over.","kit.input.late":"Too late: time's up.","kit.input.paused":"The host has paused the game.","kit.input.over":"The game is over.","kit.join.title":"Join the game","kit.join.codeLabel":"Room code","kit.join.codeHelp":"The six digits on the TV, or on the host's phone.","kit.join.year":"Year of birth","kit.join.yearFormat":"YYYY","kit.join.yearKept":"We keep only an age group, never the year.","kit.join.yearWrong":"Type the year with four digits.","kit.join.under":"These games are for ages 13 and up.","kit.join.room":"Room {code}","kit.join.changeCode":"Change","kit.join.vhubName":"Your VHub name","kit.join.nickname":"Your name in this room","kit.join.nicknameHelp":"2 to 16 letters or digits. Only this room sees it.","kit.join.avatar":"Your picture","kit.join.avatarN":"Picture {n}","kit.join.join":"Join","kit.join.joining":"Joining…","kit.join.watch":"Just watch","kit.join.code":"There's no room with this code. Check the TV and try again.","kit.join.gone":"This room has ended.","kit.join.locked":"This room is locked. Ask the host to open it.","kit.join.full":"This room is full.","kit.join.started":"The game has started, and this room doesn't take spectators.","kit.join.kicked":"The host removed you from this room.","kit.join.limited":"Too many wrong codes. Try again in a while.","kit.watching.started":"The game had already started, so you're watching. You'll play in the next one.","kit.watching.full":"The seats were full, so you're watching.","kit.display.full":"This room already has four screens.","kit.display.demoFull":"This demo already has two screens.","kit.display.key":"There's no room with this TV code. Check “Show on TV” on the host's phone and try again.","kit.pair.code":"No screen shows this code now. Check the code on the TV and try again.","kit.limit.pairs":"This screen has asked for too many codes. Try again in a while.","kit.limit.codes":"Too many wrong codes from this device. Try again in an hour.","kit.net.failed":"That didn't work. Check your connection and try again.","kit.room.closed":"This room has closed.","kit.room.notNow":"Not right now.","kit.room.notMember":"You're not in this room any more.","kit.host.only":"Only the host can do that.","kit.host.tools":"Host","kit.host.pause":"Pause","kit.host.resume":"Resume","kit.host.paused":"Paused","kit.start.host":"To start, the host has to be one of the players.","kit.start.rules":"These rules can't start a game yet.","kit.name.short":"At least 2 letters.","kit.name.long":"At most 16 letters.","kit.name.chars":"Only letters, digits, spaces and . - _ '","kit.name.rude":"That name isn't allowed. Try another one.","kit.rules.title":"Rules","kit.rules.preset":"Ready-made rules","kit.rules.custom":"Custom","kit.rules.noLimit":"No time limit","kit.rules.auto":"Auto","kit.rules.balance":"Balance","kit.rules.saveMine":"Save as my rules","kit.rules.card":"Rules","kit.rules.changed":"changed","kit.rules.lang":"Room language","kit.rules.narrator":"Narrator","kit.rules.narrator.help":"Off: the captions and sounds stay, without the voice.","kit.rules.relaxed":"Relaxed timers","kit.rules.relaxed.help":"Every time limit is one and a half times as long.","kit.rules.tooFew":"{min, plural, one {At least # player is needed.} other {At least # players are needed.}}","kit.rules.tooMany":"{max, plural, one {At most # player can play.} other {At most # players can play.}}","kit.status.host":"Host","kit.status.out":"Out","kit.status.offline":"Offline","kit.status.ready":"Ready","kit.status.level":"Level","kit.progress.title":"Your progress","kit.progress.waiting":"Adding up your XP…","kit.progress.gained":"+{xp, number} XP","kit.progress.coins":"+{coins, number} coins","kit.progress.none":"No new XP this game","kit.progress.capped":"You've earned today's XP from this game. More tomorrow.","kit.progress.level":"Level {level}","kit.progress.levelUp":"Level up!","kit.progress.bar":"Level {level}: {into, number} of {needed, number} XP","kit.progress.toNext":"{n, number} XP to level {next}","kit.progress.unlocked":"{n, plural, one {New achievement} other {# new achievements}}","kit.progress.achievement":"New achievement","kit.progress.tier.bronze":"Bronze","kit.progress.tier.silver":"Silver","kit.progress.tier.gold":"Gold","kit.progress.keep":"Sign in to keep your XP","kit.progress.keepHelp":"You're playing as a guest, so your XP lives on this phone. Sign in with Google to keep it on every device.","kit.progress.earn":"Sign in to earn XP","kit.progress.earnHelp":"With a VHub account, every game gives you XP, levels and achievements.","kit.progress.signIn":"Sign in","ach.vhub.room-regular":"Room regular","ach.vhub.room-regular.about":"Play 10 room matches, in any game.","ach.vhub.champion":"Champion","ach.vhub.champion.about":"Win a room match in two different games.","ach.vhub.level-10":"Level 10","ach.vhub.level-10.about":"Reach VHub level 10.","ach.vhub.level-25":"Level 25","ach.vhub.level-25.about":"Reach VHub level 25.","ach.vhub.level-50":"Level 50","ach.vhub.level-50.about":"Reach VHub level 50.","ach.vhub.level-100":"Level 100","ach.vhub.level-100.about":"Reach VHub level 100.","kit.tv.qr":"QR code to join the room","kit.tv.joinHelp":"Point your phone's camera at the code, or open the page and type the six digits.","kit.tv.sound":"Press OK for sound","kit.tv.leave":"Take this TV out of the room?","kit.tv.stay":"Stay","kit.tv.leaveYes":"Leave","kit.tv.title":"Show on TV","kit.tv.step1":"On the TV, open the web browser and go to {site}.","kit.tv.step2":"Type the TV code {code} with the remote.","kit.tv.link":"Or open this link on the screen, on a laptop say:","kit.tv.copied":"Link copied. Open it in the screen's web browser.","kit.tv.noMirror":"Don't mirror your phone's screen to the TV: everyone would see your secrets.","kit.tv.tableMode":"No TV? Use this phone as the table","kit.tv.joinAt":"Join at","kit.tv.roomCode":"Room code","kit.tv.howTo":"How to play","kit.tv.freeSeat":"Free seat","kit.tv.faceDown":"The card stays face down","kit.tv.awards":"Awards","kit.tvCode.label":"TV code","kit.tvCode.keypad":"Number keys","kit.tvCode.delete":"Delete","kit.tvCode.ok":"OK","kit.tvPair.qr":"QR code that opens the demo on your phone","kit.tvPair.code":"Demo code","kit.tvPair.help":"Scan the QR with your phone's camera, or type the code in the demo.","kit.tvHelp.type":"On the TV, open {site} in its web browser and type this TV code with the remote:","kit.tvHelp.or":"or type it at {site}","kit.tvHelp.link":"Or open this link on the TV or a computer:","kit.tvHelp.share":"Share the link","kit.tvHelp.copied":"Link copied","kit.tvHelp.again":"TV closed? Open the same link or type the same code again: it comes back into this room.","kit.tvHelp.join":"others join at {site}","kit.tvHelp.showing":"TV showing a code? Type it here:","kit.tvHelp.connect":"Connect","kit.tvHelp.paired":"Your TV is coming in.","kit.lobby.needMore":"{n, plural, one {Waiting for # more player} other {Waiting for # more players}}","kit.lobby.waitingHost":"Waiting for {name} to start","kit.lobby.seats":"{n} of {min} players","kit.lobby.watchingCount":"{n, plural, other {# watching}}","kit.lobby.copied":"Link copied. Paste it in a message.","kit.lobby.inviteLink":"Send this link: {link}","kit.lobby.rename":"Change name","kit.lobby.ready":"Ready","kit.lobby.getReady":"I'm ready","kit.lobby.play":"I want to play","kit.lobby.watching":"You're watching this game.","kit.lobby.start":"Start","kit.lobby.rules":"Rules","kit.lobby.invite":"Invite","kit.lobby.tv":"Show on TV","kit.lobby.lock":"Lock room","kit.lobby.locked":"Room locked","kit.lobby.kickTitle":"Remove from the room?","kit.lobby.kick":"Remove","kit.invite.title":"Come and play","kit.invite.text":"Join my room: code {code}","kit.invite.send":"Send your friends this link","kit.invite.copy":"Copy the link","kit.invite.scan":"Or they scan this code with their phone's camera.","kit.consent.title":"Privacy choice","kit.consent.text":"May we count how the game is played (with Google Analytics), to fix problems and make it better?","kit.consent.privacy":"Privacy policy","kit.consent.deny":"Don't allow","kit.consent.allow":"Allow","kit.ads.label":"Advertisement","kit.ads.test":"Test ad","kit.ads.tvPlaying":"The TV is showing a short ad. You can start when it ends.","kit.ads.off":"This room shows no ads.","kit.pass.thanks":"No ads tonight, thanks to {name}'s Host Pass","kit.pass.nudgeTitle":"Skip these for good","kit.pass.nudgeBody":"Host Pass · {price} once","kit.pass.nudgeLines":`No banners on any phone in your rooms
No video between games on the TV
Pay once, for every room you host`,"kit.pass.see":"See the pass","kit.pass.notNow":"Not now","kit.store.title":"Store","kit.store.balance":"Your coins: {coins, number}","kit.store.tabs":"Store sections","kit.store.sets":"Sets","kit.store.looks":"Looks","kit.store.pass":"Host Pass","kit.store.empty":"New looks are on their way.","kit.store.worth":"Worth {coins, number} coins one by one","kit.store.coinPrice":"{coins, number} coins","kit.store.inPacks":"{euro} in coin packs","kit.store.buy":"Buy","kit.store.yours":"Yours","kit.store.equip":"Equip","kit.store.unequip":"Unequip","kit.store.short":"Short by {n, number} coins","kit.store.partOwned":"You already have some of these. Get the rest one by one.","kit.store.askHost":"Ask whoever runs the evening","kit.store.signIn":"Sign in to buy","kit.store.signInHelp":"Looks belong to your VHub account, so they follow you to every device.","kit.store.holds":"Everything in it","kit.store.slot.portrait":"Portrait","kit.store.slot.seal":"Wax seal","kit.store.slot.cardBack":"Card back","kit.store.slot.plate":"Name plate","kit.hold.see":"Hold to see","kit.hold.screenReader":"Your screen reader reads the card aloud: use headphones.","kit.secret.title":"Secret actions","kit.secret.none":"No secret actions right now.","kit.secret.hold":"Hold to open. Every phone has this.","kit.phone.keepOn":"Keep your screen on during the game, or your phone may drop out.","kit.phone.views":"Views","kit.phone.you":"You","kit.phone.table":"Table","kit.phone.room":"Room","kit.phone.menu":"Menu","kit.account.signIn":"Sign in to VHub","kit.account.yours":"Your VHub account","kit.account.yoursLevel":"Your VHub account, level {level}","kit.connection.online":"Connected","kit.connection.reconnecting":"Reconnecting","kit.connection.offline":"Offline","kit.menu.title":"Settings","kit.menu.gamePicture":"Use my character's picture instead","kit.menu.roomHelp":"Others join with this code.","kit.menu.language":"Language on this phone","kit.menu.music":"Music","kit.menu.sounds":"Sound effects","kit.menu.voice":"Narrator voice","kit.menu.vibration":"Vibration","kit.menu.musicLevel":"Music volume","kit.menu.soundsLevel":"Sound effects volume","kit.menu.voiceLevel":"Narrator volume","kit.menu.soundHelp":"For the phone that plays the room's sound, when there's no TV.","kit.menu.textSize":"Text size","kit.menu.captions":"The narrator's words on this phone","kit.menu.calm":"Less motion","kit.menu.analytics":"Help make the game better (Google Analytics)","kit.menu.adChoices":"Ad choices","kit.menu.leaveSure":"Leave the room? You can come back with the code.","kit.menu.leave":"Leave the room","kit.legal.rights":"All rights reserved","kit.legal.gemi":"G.E.MI. no. 181823306000","kit.legal.vat":"VAT no. EL802736373","kit.legal.company":"Company","kit.legal.privacy":"Privacy","kit.legal.terms":"Terms"};class Di extends Error{constructor(){super(...arguments);ee(this,"name","MessageSyntaxError")}}const it=/[A-Za-z0-9_]/,Fi=/[A-Za-z0-9_=-]/;class Ii{constructor(e){ee(this,"text");ee(this,"i",0);this.text=e}parse(){const e=this.message(!1);if(this.i<this.text.length)throw this.error('a "}" with no "{"');return e}message(e){const i=[];let o="";for(;this.i<this.text.length;){const n=this.text[this.i];if(n==="}")break;n==="'"?o+=this.apostrophe(e):n==="{"||n==="#"&&e?(o&&i.push(o),o="",n==="#"?(i.push({kind:"pound"}),this.i++):i.push(this.argument())):(o+=n,this.i++)}return o&&i.push(o),i}apostrophe(e){const i=this.text[this.i+1];if(i==="'")return this.i+=2,"'";if(this.i++,i!=="{"&&i!=="}"&&!(e&&i==="#"))return"'";let o="";for(;this.i<this.text.length;){const n=this.text[this.i];if(n==="'"&&this.text[this.i+1]==="'")o+="'",this.i+=2;else{if(n==="'")return this.i++,o;o+=n,this.i++}}return o}argument(){this.i++,this.space();const e=this.word(it);if(!e)throw this.error("an argument with no name");if(this.space(),this.text[this.i]==="}")return this.i++,{kind:"arg",name:e};this.expect(","),this.space();const i=this.word(it);if(this.space(),i==="number")return this.expect("}"),{kind:"number",name:e};if(i!=="plural"&&i!=="select")throw this.error(`an unknown type "${i}" in {${e}}`);this.expect(","),this.space();const o=new Map;for(;this.text[this.i]!=="}";){if(this.i>=this.text.length)throw this.error(`{${e}, ${i}} isn't closed`);const n=this.word(Fi);if(!n)throw this.error(`a case name in {${e}, ${i}}`);if(n.startsWith("=")&&(i==="select"||!/^=\d+$/.test(n)))throw this.error(`the case "${n}" in {${e}, ${i}}`);if(o.has(n))throw this.error(`the case "${n}" twice in {${e}, ${i}}`);this.space(),this.expect("{"),o.set(n,this.message(i==="plural")),this.expect("}"),this.space()}if(this.i++,!o.has("other"))throw this.error(`{${e}, ${i}} has no "other" case`);return{kind:i,name:e,cases:o}}word(e){const i=this.i;for(;this.i<this.text.length&&e.test(this.text[this.i]);)this.i++;return this.text.slice(i,this.i)}space(){for(;this.i<this.text.length&&/\s/.test(this.text[this.i]);)this.i++}expect(e){if(this.text[this.i]!==e)throw this.error(`"${e}"`);this.i++}error(e){return new Di(`expected ${e} at ${this.i} in "${this.text}"`)}}const ot=new Map;function Ui(t){let e=ot.get(t);return e||(e=new Ii(t).parse(),ot.set(t,e)),e}const rt=new Map,nt=new Map;function at(t){let e=rt.get(t);return e||(e=new Intl.NumberFormat(t),rt.set(t,e)),e}function Yi(t){let e=nt.get(t);return e||(e=new Intl.PluralRules(t),nt.set(t,e)),e}function st(t,e,i){let o;try{o=Ui(t)}catch{return t}return Ae(o,e??{},i,null)}function Ae(t,e,i,o){let n="";for(const r of t){if(typeof r=="string"){n+=r;continue}if(r.kind==="pound"){n+=o===null?"#":at(i).format(o);continue}const a=Object.prototype.hasOwnProperty.call(e,r.name)?e[r.name]:void 0;switch(r.kind){case"arg":n+=a===void 0?`{${r.name}}`:String(a);break;case"number":n+=a===void 0?`{${r.name}}`:typeof a=="number"?at(i).format(a):a;break;case"plural":{const l=typeof a=="number"?a:Number(a),d=`=${l}`,p=r.cases.has(d)?d:Number.isFinite(l)?Yi(i).select(l):"other",c=r.cases.get(p)??r.cases.get("other")??[];n+=Ae(c,e,i,Number.isFinite(l)?l:null);break}case"select":{const l=r.cases.get(String(a))??r.cases.get("other")??[];n+=Ae(l,e,i,o);break}}}return n}const ue={el:{...Oi},en:{...Ri}};function Bi(t){for(const e of Mi)Object.assign(ue[e],t[e]??{})}function pt(t,e){return Object.prototype.hasOwnProperty.call(ue[t],e)}const lt=new Set;function Wi(t,e,i){if(pt(t,e))return st(ue[t][e],i,t);lt.has(`${t}:${e}`)||(lt.add(`${t}:${e}`),console.warn(`party-kit i18n: no "${e}" in ${t}`));const o=t==="el"?"en":"el";return pt(o,e)?st(ue[o][e],i,o):e}function Gi(t){for(const e of t){const i=e.toLowerCase().split("-")[0];if(i==="el"||i==="en")return i}return t.length>0?"en":"el"}function qi(){return typeof navigator>"u"?[]:navigator.languages&&navigator.languages.length>0?navigator.languages:navigator.language?[navigator.language]:[]}function Yt(t){return t??Gi(qi())}const J=E(Yt(A.language.get()));A.language.watch(t=>{J.value=Yt(t)});function Xi(t){J.value=t,A.language.set(t)}const Ki={el:"Ελληνικά",en:"English"},Bt=si(null);function Fe(){return ki(Bt)??J.value}function Wt(){const t=Fe();return(e,i)=>Wi(t,e,i)}const Zi='input, textarea, [contenteditable]:not([contenteditable="false"])';function ct(t){const e=t==null?void 0:t.closest;return typeof e=="function"&&e.call(t,Zi)!==null}function Ji(t){return t.key==="F12"||t.ctrlKey&&!t.altKey&&!t.metaKey&&(t.shiftKey?/^Key[IJC]$/:/^KeyU$/).test(t.code)||t.metaKey&&t.altKey&&!t.ctrlKey&&/^Key[IJCU]$/.test(t.code)}const dt=new WeakSet;function eo(t=typeof document>"u"?void 0:document){!t||dt.has(t)||(dt.add(t),t.addEventListener("contextmenu",e=>{ct(e.target)||e.preventDefault()}),t.addEventListener("dragstart",e=>{var i;((i=e.target)==null?void 0:i.tagName)==="IMG"&&e.preventDefault()}),t.addEventListener("keydown",e=>{Ji(e)&&!ct(e.target)&&e.preventDefault()},!0))}const kt={en:["Stop!",`This site, with its art, music and code, belongs to VGraphics. Copying any of it is not allowed.
Terms of use: https://vgraphics.gr/terms/`],el:["Σταματήστε!",`Αυτός ο ιστότοπος, με την τέχνη, τη μουσική και τον κώδικά του, ανήκει στη VGraphics. Δεν επιτρέπεται η αντιγραφή κανενός μέρους του.
Όροι χρήσης: https://vgraphics.gr/terms/`]},ht=Symbol.for("vgraphics.console-warning");function to(t,e=console.log){if(typeof window>"u")return;const i=globalThis;if(i[ht])return;i[ht]=!0;const[o,n]=kt[t]??kt.en;e(`%c${o}%c
${n}`,"color:#E5322D;font-size:52px;font-weight:bold;-webkit-text-stroke:1px #000","font-size:16px;line-height:1.5")}const ut=`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 56 56' fill='none' stroke='%23000' stroke-width='1.6' stroke-linecap='round'%3E%3Cpath d='M2 54V2h52'/%3E%3Cpath d='M9 54V9h45'/%3E%3Cpath d='M9 25a16 16 0 0 1 16-16M9 37a28 28 0 0 1 28-28'/%3E%3Cpath d='M9 9l13 13M9 17l7 7M17 9l7 7'/%3E%3C/svg%3E")`,io=`
.pk-root {
  --pk-ground: #0B1623; --pk-ground-rgb: 11, 22, 35; --pk-panel: #101D2E; --pk-panel-rgb: 16, 29, 46;
  --pk-card: #16263B; --pk-rule: #2B3D57;
  --pk-text: #F3EADA; --pk-text-rgb: 243, 234, 218; --pk-text-dim: #B3AC9D; --pk-line: #B3AC9D;
  --pk-accent: #E2B878; --pk-accent-rgb: 226, 184, 120; --pk-on-accent: #0B1623; --pk-accent-soft: rgba(226, 184, 120, 0.14);
  --pk-good: #C9D4E6; --pk-danger: #EA7B70; --pk-danger-rgb: 234, 123, 112; --pk-cool: #C9D4E6; --pk-second: #C9D4E6;
  --pk-stamp: #EA7B70; --pk-face: #F3EADA; --pk-face-ink: #0B1623; --pk-mark: #EB8E96;
  --pk-font-ui: "Sofia Sans", system-ui, "Segoe UI", Roboto, "Noto Sans", sans-serif;
  --pk-font-names: "Sofia Sans Condensed", "Sofia Sans", "Roboto Condensed", "Arial Narrow", sans-serif;
  --pk-font-display: "Noto Serif Display", "Noto Serif", Georgia, serif; --pk-display-stretch: 72%;
  --pk-font-digits: "Cousine", ui-monospace, "Roboto Mono", monospace;
  background: var(--pk-ground); color: var(--pk-text); font-family: var(--pk-font-ui); line-height: 1.4;
  -webkit-text-size-adjust: 100%; text-size-adjust: 100%;
}
.pk-root[data-theme="quizfall"] {
  --pk-ground: #022D3A; --pk-ground-rgb: 2, 45, 58; --pk-panel: #053A4B; --pk-panel-rgb: 5, 58, 75;
  --pk-card: #0A4557; --pk-rule: #1D6074;
  --pk-text: #FAF0DC; --pk-text-rgb: 250, 240, 220; --pk-text-dim: #A9C6C6; --pk-line: #A9C6C6;
  --pk-accent: #FFA94D; --pk-accent-rgb: 255, 169, 77; --pk-on-accent: #022D3A; --pk-accent-soft: rgba(255, 169, 77, 0.14);
  --pk-good: #43D6A6; --pk-danger: #FF7A66; --pk-danger-rgb: 255, 122, 102; --pk-cool: #2CC4D4; --pk-second: #2CC4D4;
  --pk-stamp: #43D6A6; --pk-face: #FAF0DC; --pk-face-ink: #022D3A;
  --pk-font-ui: "Commissioner", system-ui, "Segoe UI", Roboto, "Noto Sans", sans-serif;
  --pk-font-names: "Commissioner", system-ui, sans-serif;
  --pk-font-display: "Commissioner", system-ui, sans-serif; --pk-display-stretch: 100%;
  --pk-font-digits: "Tektur", "Commissioner", ui-monospace, monospace;
}
.pk-root[data-theme="vgraphics"] {
  --pk-ground: #0B0C12; --pk-ground-rgb: 11, 12, 18; --pk-panel: #13151D; --pk-panel-rgb: 19, 21, 29;
  --pk-card: #1A1D27; --pk-rule: #30354A;
  --pk-text: #F4F0E8; --pk-text-rgb: 244, 240, 232; --pk-text-dim: #ABADB8; --pk-line: #ABADB8;
  --pk-accent: #E5B833; --pk-accent-rgb: 229, 184, 51; --pk-on-accent: #0B0C12; --pk-accent-soft: rgba(229, 184, 51, 0.14);
  --pk-good: #588FFA; --pk-danger: #E07A7E; --pk-danger-rgb: 224, 122, 126; --pk-cool: #588FFA; --pk-second: #588FFA;
  --pk-stamp: #E07A7E; --pk-face: #F4F0E8; --pk-face-ink: #0B0C12;
  --pk-font-ui: "Sofia Sans", system-ui, "Segoe UI", Roboto, "Noto Sans", sans-serif;
  --pk-font-names: "Sofia Sans Condensed", "Sofia Sans", "Roboto Condensed", "Arial Narrow", sans-serif;
  --pk-font-display: "Sofia Sans", system-ui, sans-serif; --pk-display-stretch: 100%;
  --pk-font-digits: "Sofia Sans", system-ui, sans-serif;
}
.pk-root *, .pk-root *::before, .pk-root *::after { box-sizing: border-box; }
.pk-root button, .pk-root input { font: inherit; color: inherit; }
.pk-root ul, .pk-root ol { margin: 0; padding: 0; }
.pk-root p { margin: 0; }
.pk-root a { color: var(--pk-accent); }
/* hidden hides, whatever display a class gives (the phone's Table panel is a grid, and showed under You). */
.pk-root [hidden] { display: none !important; }
.pk-sr {
  position: absolute !important; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden;
  clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;
}
.pk-root :focus { outline: 3px solid var(--pk-accent); outline-offset: 2px; }
.pk-phone :focus:not(:focus-visible) { outline: none; }
.pk-icon { width: 1.25em; height: 1.25em; flex: none; vertical-align: -0.2em; }
.pk-icon-bad { color: var(--pk-danger); }

/* No selecting, no long-press menu and no dragging pictures (George, 26 Oct 2026: "Dont allow text selection and right
   clicking in any page. Global rule. Selected highlighted text must have color of app or game."): on the whole page,
   since the legal line and the TV's welcome sit outside the root; guardPage blocks the right-click menu. The fields
   people type in (names, room codes) keep both, so paste works, and what's selected shows in the look's accent. */
html { -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; }
img { -webkit-user-drag: none; }
input, textarea, [contenteditable]:not([contenteditable="false"]) {
  -webkit-user-select: text; user-select: text; -webkit-touch-callout: default;
}
.pk-root ::selection { background: var(--pk-accent); color: var(--pk-on-accent); }

/* Words and buttons */
.pk-title { margin: 0; font-size: 1.3em; font-weight: 700; line-height: 1.2; }
.pk-label, .pk-rule-label { display: block; font-weight: 600; }
.pk-help { color: var(--pk-text-dim); font-size: 0.92em; }
.pk-help-bad, .pk-problem { color: var(--pk-danger); }
.pk-problems { list-style: none; display: grid; gap: 0.4em; }
.pk-problem { display: flex; gap: 0.5em; align-items: flex-start; }
.pk-actions { display: flex; gap: 0.75em; flex-wrap: wrap; }
.pk-actions > .pk-btn { flex: 1 1 8em; }
.pk-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 0.5em; min-height: 48px;
  padding: 0.55em 1.2em; border: 2px solid var(--pk-line); border-radius: 12px; background: transparent;
  color: var(--pk-text); font-size: 1.15em; font-weight: 600; line-height: 1.2; text-align: center; cursor: var(--cursor-link, pointer);
}
.pk-btn:disabled { opacity: 0.45; cursor: var(--cursor, default); }
/* The colours under .pk-root, or the reset's ".pk-root button { color: inherit }" wins over one class. */
.pk-root .pk-btn-primary { background: var(--pk-accent); border-color: var(--pk-accent); color: var(--pk-on-accent); }
.pk-root .pk-btn-on { border-color: var(--pk-good); color: var(--pk-good); }
.pk-root .pk-btn-danger { border-color: var(--pk-danger); color: var(--pk-danger); }
.pk-btn-wide { width: 100%; }
.pk-icon-btn {
  display: inline-flex; align-items: center; justify-content: center; min-width: 48px; min-height: 48px;
  padding: 0; border: 0; border-radius: 50%; background: none; color: var(--pk-text); cursor: var(--cursor-link, pointer);
}
.pk-account {
  position: relative; flex: none; display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px;
  padding: 0; border: 1px solid rgba(var(--pk-text-rgb), 0.14); border-radius: 50%; background: rgba(var(--pk-ground-rgb), 0.55);
  cursor: var(--cursor-link, pointer);
}
.pk-account-in { border-color: var(--pk-accent); }
/* A first screen's very right top icon: in the corner, clear of the notch and the rounded corners. */
.pk-account-corner {
  position: fixed; top: max(12px, env(safe-area-inset-top)); right: max(12px, env(safe-area-inset-right)); z-index: 5;
}
.pk-account-mark { display: block; width: 24px; height: 24px; }
.pk-account-mark svg, .pk-account-badge svg { display: block; width: 100%; height: 100%; }
.pk-account-pic {
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; overflow: hidden;
  border-radius: 50%; background: var(--pk-card);
}
.pk-account-pic img { display: block; width: 100%; height: 100%; object-fit: cover; }
.pk-account-initial { font-family: var(--pk-font-display); font-size: 1.2em; font-weight: 700; color: var(--pk-text); }
.pk-account-badge {
  position: absolute; right: -1px; bottom: -1px; width: 18px; height: 18px; padding: 2px; border-radius: 4px;
  background: var(--pk-text);
}
.pk-root .pk-link { padding: 0.4em 0; border: 0; background: none; color: var(--pk-accent); text-decoration: underline; cursor: var(--cursor-link, pointer); }
.pk-spinner {
  width: 1em; height: 1em; border: 2px solid currentColor; border-right-color: transparent; border-radius: 50%;
  animation: pk-spin 0.8s linear infinite;
}
@keyframes pk-spin { to { transform: rotate(360deg); } }

/* Fields */
.pk-input {
  width: 100%; min-height: 52px; padding: 0.5em 0.75em; border: 2px solid var(--pk-line); border-radius: 12px;
  background: var(--pk-card); color: var(--pk-text); font-size: 1.15em;
}
.pk-input[aria-invalid="true"] { border-color: var(--pk-danger); }
.pk-code-input, .pk-year-input {
  font-family: var(--pk-font-digits); font-size: 2em; text-align: center; font-variant-numeric: tabular-nums;
}
.pk-field { display: grid; gap: 0.4em; }
.pk-switch {
  display: inline-flex; align-items: center; gap: 0.6em; min-height: 48px; padding: 0; border: 0; background: none;
  cursor: var(--cursor-link, pointer);
}
.pk-switch-track {
  position: relative; width: 3em; height: 1.7em; flex: none; border: 2px solid var(--pk-line); border-radius: 1em;
  transition: background-color 0.15s, border-color 0.15s;
}
.pk-switch-knob {
  position: absolute; top: 0.15em; left: 0.15em; width: 1.1em; height: 1.1em; border-radius: 50%;
  background: var(--pk-text-dim); transition: transform 0.15s;
}
.pk-switch-on .pk-switch-track { border-color: var(--pk-accent); background: var(--pk-accent); }
.pk-switch-on .pk-switch-knob { transform: translateX(1.3em); background: var(--pk-on-accent); }
.pk-chips { display: flex; flex-wrap: wrap; gap: 0.5em; }
.pk-chip {
  position: relative; display: inline-flex; align-items: center; min-height: 44px; padding: 0.35em 0.95em;
  border: 2px solid var(--pk-rule); border-radius: 999px; cursor: var(--cursor-link, pointer);
  /* A game's own chips may be buttons: none of the browser's grey or its font. */
  background: none; color: inherit; font: inherit;
}
.pk-chip-on { border-color: var(--pk-accent); background: var(--pk-accent-soft); font-weight: 700; }
.pk-chip-on::before { content: "\\2713"; margin-right: 0.4em; color: var(--pk-accent); }
.pk-chip-input { position: absolute; width: 1px; height: 1px; margin: 0; opacity: 0; pointer-events: none; }
.pk-chip:focus-within { outline: 3px solid var(--pk-accent); outline-offset: 2px; }
.pk-stepper { display: inline-flex; align-items: center; gap: 0.5em; }
.pk-step {
  display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; padding: 0;
  border: 2px solid var(--pk-line); border-radius: 50%; background: none; cursor: var(--cursor-link, pointer);
}
.pk-step:disabled { opacity: 0.4; cursor: var(--cursor, default); }
.pk-step-value { min-width: 5em; text-align: center; font-weight: 700; font-variant-numeric: tabular-nums; }
/* A sound's loudness under its switch: the words, then the bar and its level. The bar is a native range input, 44px
 tall for a thumb, in the look's accent. */
.pk-slider { display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 0.2em 0.8em; padding-top: 0.3em; }
.pk-slider-label { grid-column: 1 / -1; color: var(--pk-text-dim); font-size: 0.92em; }
.pk-slider-input { width: 100%; min-height: 44px; margin: 0; accent-color: var(--pk-accent); cursor: var(--cursor-link, pointer); }
.pk-slider-input:focus-visible { outline: 3px solid var(--pk-accent); outline-offset: 2px; }
.pk-slider-value { min-width: 3.2em; text-align: right; font-weight: 700; font-variant-numeric: tabular-nums; }
.pk-menu-sound-help { padding: 0.6em 0 0.2em; }

/* Avatars and player tiles */
.pk-avatar {
  display: inline-flex; align-items: center; justify-content: center; flex: none; width: 2.6em; height: 2.6em;
  border: 2px solid var(--pk-line); border-radius: 50%; background: var(--pk-card); object-fit: cover;
}
/* The game's preset portraits: drawn for it (cropped to the head and shoulders, in the game's own colours), shown as
   they are; a lit ground shows only through a transparent one. */
.pk-avatar-art { position: relative; overflow: hidden; background: radial-gradient(circle at 50% 36%, rgba(var(--pk-accent-rgb), 0.24), var(--pk-card) 66%); }
.pk-avatar-art img { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; }
.pk-avatar-s { width: 1.9em; height: 1.9em; font-size: 0.9em; }
.pk-avatar-l { width: 4.2em; height: 4.2em; font-size: 1.1em; }
.pk-avatar-initial { font-family: var(--pk-font-display); font-weight: 700; color: var(--pk-text); }
.pk-avatar-empty { border-style: dashed; border-color: var(--pk-rule); background: none; }
/* The picker: a grid filling the width, columns that leave no one alone on a row (AvatarPicker sets them). */
.pk-avatars { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.6em; }
.pk-avatar-choice { position: relative; min-width: 0; padding: 3px; border: 2px solid transparent; border-radius: 50%; background: none; cursor: var(--cursor-link, pointer); }
.pk-avatar-choice .pk-avatar { display: block; width: 100%; height: auto; }
.pk-avatar-choice[aria-checked="true"] { border-color: var(--pk-accent); }
.pk-avatar-tick {
  position: absolute; right: -2px; bottom: -2px; width: 1.55em; height: 1.55em; padding: 0.22em; border-radius: 50%;
  background: var(--pk-accent); color: var(--pk-on-accent);
}
/* A VHub player's rank frame (Avatar's frame): the avatar keeps its box whatever the frame, so tiles and rows line up.
   Avatar scales the picture (a little larger than the frame's opening, smaller only where the frame's ornaments would
   reach past a quarter of the picture on a side) and places the drawing around it in percent of the box; the drawing
   takes the place of the ring. Rows keep a gap of about 0.4 pictures beside the avatar for it, as the hub's lists do. */
.pk-avatar.pk-ranked { position: relative; overflow: visible; border: 0; }
.pk-ranked-pic { display: block; width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
.pk-ranked > .pk-ranked-art { position: absolute; max-width: none; object-fit: fill; pointer-events: none; }
.pk-tile { position: relative; display: flex; flex-direction: column; align-items: center; gap: 0.2em; min-width: 0; text-align: center; }
.pk-tile-face { position: relative; display: inline-flex; }
.pk-tile-name {
  max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  font-family: var(--pk-font-names); font-weight: 600;
}
.pk-tile-out .pk-avatar, .pk-tile-out .pk-tile-name { opacity: 0.5; }
.pk-tile-out .pk-tile-name { text-decoration: line-through; }
.pk-tile-offline .pk-avatar { border-style: dashed; }
.pk-tile-badges { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.25em 0.6em; color: var(--pk-text-dim); }
.pk-badge { display: inline-flex; align-items: center; gap: 0.2em; }
.pk-badge-word { font-size: 0.85em; }
.pk-level {
  position: absolute; right: -0.4em; bottom: -0.2em; min-width: 1.6em; padding: 0 0.3em; border-radius: 999px;
  background: var(--pk-accent); color: var(--pk-on-accent); font-size: 0.7em; font-weight: 700; text-align: center;
}
/* A list that scrolls in its own box (fade-list.tsx sets its height, 3.5 rows, and its fading ends): a thin scrollbar
   in the game's colour, and 4 px of room inside, given back outside, so a row's focus ring isn't cut by the box. */
.pk-root .pk-fade {
  position: relative; margin: -4px; padding: 4px; overflow-y: auto; overscroll-behavior: contain;
  scrollbar-width: thin; scrollbar-color: var(--pk-scrollbar, var(--pk-accent)) transparent;
}
.pk-fade::-webkit-scrollbar { width: 6px; }
.pk-fade::-webkit-scrollbar-track { background: transparent; }
.pk-fade::-webkit-scrollbar-thumb { border-radius: 3px; background: var(--pk-scrollbar, var(--pk-accent)); }
/* A phone draws its scrollbar over the rows: a box that scrolls keeps a lane for it, clear of the words. */
.pk-phone .pk-fade-scrolls { padding-right: 16px; }
.pk-player-list { list-style: none; display: grid; gap: 0.5em; }
.pk-player-list .pk-tile { flex-direction: row; flex-wrap: wrap; gap: 0.6em 1.1em; text-align: left; }
/* The name keeps its width; the statuses wrap under it when the row is full (they had cut "Host" to "Ho…"). */
.pk-player-list .pk-tile-name { flex: 1 0 auto; }
.pk-player-list .pk-tile-badges { justify-content: flex-end; }
/* A row in the lobby's list, the same whether it's the host's button (to remove a player) or a guest's plain row. */
.pk-player-row {
  display: block; width: 100%; padding: 0.45em 0.7em; border: 1px solid var(--pk-rule); border-radius: 12px; background: var(--pk-card);
  text-align: left;
}
.pk-player-pick { cursor: var(--cursor-link, pointer); }

/* Rules */
.pk-rules { display: grid; gap: 0.25em; }
/* The rules screen's title and Done, under the phone's fixed head while the long list scrolls. */
.pk-rules-head {
  position: sticky; top: var(--pk-head-h, 0px); z-index: 4; display: flex; align-items: center; justify-content: space-between;
  gap: 1em; margin: -1em -1.1em 0; padding: 0.55em 1.1em; border-bottom: 1px solid var(--pk-rule); background: var(--pk-panel);
}
.pk-rules-head .pk-btn { min-height: 44px; padding: 0.35em 1.1em; font-size: 1em; }
.pk-rule { display: grid; gap: 0.45em; padding: 0.85em 0; border-bottom: 1px solid var(--pk-rule); }
.pk-rule-flagged { padding-left: 0.75em; border-left: 4px solid var(--pk-danger); }
.pk-counts { display: grid; gap: 0.4em; }
.pk-count { display: flex; align-items: center; justify-content: space-between; gap: 0.75em; }
.pk-balance { position: relative; height: 0.6em; margin: 0.6em 0.4em; border-radius: 999px; background: var(--pk-rule); }
.pk-balance-mark {
  position: absolute; top: 50%; width: 1.2em; height: 1.2em; margin: -0.6em 0 0 -0.6em; border-radius: 50%;
  background: var(--pk-accent);
}
.pk-balance-word { font-weight: 600; }
.pk-card { padding: 1em 1.2em; border: 1px solid var(--pk-rule); border-radius: 16px; background: var(--pk-card); }
.pk-card-title { margin: 0 0 0.6em; font-size: 1.05em; font-weight: 700; }
.pk-card-rows { display: grid; gap: 0.3em; margin: 0; }
.pk-card-row { display: flex; justify-content: space-between; gap: 1em; padding: 0.2em 0.45em; border-radius: 8px; }
.pk-card-row dt { color: var(--pk-text-dim); }
.pk-card-row dd { margin: 0; font-weight: 600; text-align: right; }
/* The roles in play as chips on a line of their own, under their label (the phone's lobby). */
.pk-card-row-chips { flex-direction: column; gap: 0.4em; }
.pk-card-row-chips dd { text-align: left; }
.pk-card-chip {
  display: inline-flex; align-items: center; min-height: 34px; padding: 0.15em 0.75em; border: 1.5px solid var(--pk-rule);
  border-radius: 999px; font-size: 0.92em;
}
.pk-changed { outline: 2px solid var(--pk-accent); background: var(--pk-accent-soft); }
.pk-changed-word { display: inline-flex; align-items: center; gap: 0.25em; margin-left: 0.5em; color: var(--pk-accent); font-size: 0.85em; }

/* Sheets */
/* In: the backdrop fades as the sheet rises (260 ms); out: the same back, a little faster (200 ms, Sheet's SHEET_CLOSE_MS). */
.pk-sheet-backdrop {
  position: fixed; top: 0; right: 0; bottom: 0; left: 0; z-index: 20; display: flex; align-items: flex-end; background: rgba(0, 0, 0, 0.6);
  animation: pk-fade 0.2s ease-out both;
}
.pk-sheet {
  display: grid; gap: 0.75em; width: 100%; max-height: 88%; overflow: auto; padding: 1em 1.1em 1.5em;
  padding-bottom: calc(1.5em + env(safe-area-inset-bottom, 0px)); border-top: 2px solid var(--pk-line);
  border-radius: 20px 20px 0 0; background: var(--pk-panel); animation: pk-sheet-in 0.26s cubic-bezier(0.2, 0.8, 0.2, 1) both;
}
.pk-sheet-head { display: flex; align-items: center; justify-content: space-between; gap: 1em; }
.pk-sheet-out { animation: pk-fade-out 0.2s ease-in both; }
.pk-sheet-out .pk-sheet { animation: pk-sheet-down 0.2s cubic-bezier(0.4, 0, 1, 1) both; }
@keyframes pk-sheet-in { from { transform: translateY(100%); } to { transform: none; } }
@keyframes pk-sheet-down { from { transform: none; } to { transform: translateY(100%); } }
/* Show on TV (phone/tv-help.tsx): the TV code to read off, its link and Share, the room code, both ways in, and how a TV
   that closed comes back. */
.pk-tv-help-code { color: var(--pk-accent); font-family: var(--pk-font-digits); font-size: 1.9em; font-weight: 700; letter-spacing: 0.04em; white-space: nowrap; }
.pk-tv-help-room { display: flex; align-items: baseline; justify-content: space-between; gap: 1em; padding: 0.6em 0.8em; border-radius: 12px; background: rgba(var(--pk-text-rgb), 0.06); }
.pk-tv-help-room b { font-family: var(--pk-font-digits); font-size: 1.2em; letter-spacing: 0.04em; white-space: nowrap; }
.pk-tv-help-again { display: flex; align-items: flex-start; gap: 0.6em; padding: 0.7em 0.8em; border: 1px dashed rgba(var(--pk-accent-rgb), 0.6); border-radius: 12px; }
.pk-tv-help-again .pk-icon { flex: none; width: 1.3em; height: 1.3em; color: var(--pk-accent); }
.pk-tv-help-form { display: grid; gap: 0.5em; }
.pk-tv-help-pair { display: flex; gap: 0.5em; }
.pk-tv-help-pair .pk-input { flex: 1 1 auto; min-width: 0; font-variant-numeric: tabular-nums; letter-spacing: 0.04em; }
.pk-tv-help-pair .pk-btn { flex: none; }
.pk-steps { padding-left: 1.4em; display: grid; gap: 0.5em; }
.pk-no-mirror { display: grid; gap: 0.5em; padding: 0.8em; border: 1px solid var(--pk-danger); border-radius: 12px; }
.pk-no-mirror-pic { display: flex; gap: 0.5em; font-size: 1.4em; }
.pk-confirm { display: grid; gap: 0.75em; }

/* Join: the steps run down the screen, their buttons in a bar at its foot (above a game's own legal line, whose height
   the game gives as --pk-legal-h). */
.pk-join { display: flex; flex-direction: column; gap: 1.25em; min-height: 100vh; max-width: 28em; margin: 0 auto; padding: 1.5em 1.1em 0; }
.pk-join-logo { display: flex; }
.pk-join-title { margin: 0; font-family: var(--pk-font-display); font-size: 1.8em; line-height: 1.15; }
.pk-join-step { display: flex; flex: 1; flex-direction: column; gap: 0.85em; }
.pk-join-bar {
  position: sticky; bottom: var(--pk-legal-h, 0px); z-index: 3; display: flex; gap: 0.6em; margin-top: auto; padding: 0.8em 0 1em;
  padding-bottom: calc(1em + env(safe-area-inset-bottom, 0px)); background: var(--pk-ground);
}
.pk-join-bar > .pk-btn { flex: 1 1 0; }
/* The code: one real field over six boxes, two threes as the TV shows it. */
.pk-code-boxes { position: relative; }
.pk-code-digits { display: grid; grid-template-columns: repeat(3, 1fr) 0.5em repeat(3, 1fr); gap: 0.4em; pointer-events: none; }
.pk-code-box {
  display: flex; align-items: center; justify-content: center; height: 2.3em; border: 2px solid var(--pk-rule); border-radius: 12px;
  background: var(--pk-card); font-family: var(--pk-font-digits); font-size: 1.7em; font-weight: 700;
}
.pk-code-box:nth-child(4) { grid-column: 5; }
.pk-code-box-on { border-color: var(--pk-line); }
.pk-code-typing .pk-code-box-next { border-color: var(--pk-accent); box-shadow: 0 0 0 3px var(--pk-accent-soft); }
.pk-code-boxes .pk-code-input {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; background: transparent; color: transparent;
  caret-color: transparent;
}
.pk-code-boxes .pk-code-input:focus { outline: none; }
.pk-code-boxes .pk-code-input::selection { background: transparent; color: transparent; }
.pk-join-room { color: var(--pk-text-dim); }
.pk-join-vhub { display: flex; align-items: center; gap: 1.9em; }
.pk-join-name, .pk-lobby-name { font-size: 1.3em; font-weight: 700; }
.pk-join-under { font-size: 1.25em; font-weight: 600; }

/* Lobby (phone) */
.pk-lobby { display: grid; gap: 1em; }
.pk-lobby-me { display: flex; align-items: center; gap: 1.9em; }
.pk-lobby-watching, .pk-lobby-waiting { display: flex; align-items: center; gap: 0.5em; color: var(--pk-text-dim); }
.pk-lobby-links { display: flex; flex-wrap: wrap; gap: 0 1.1em; }
.pk-lobby-waiting { flex-wrap: wrap; justify-content: space-between; }
.pk-lobby-players { display: grid; gap: 0.6em; }
/* A dot for each seat the game needs. Not .pk-seats/.pk-seat: those are the TV lobby's 184 px medallion seats, and
   sharing them laid these dots across the phone at 728 px and gave the TV's seats round borders. */
.pk-pips { display: inline-flex; gap: 0.3em; }
.pk-pip { width: 0.85em; height: 0.85em; border: 2px solid var(--pk-text-dim); border-radius: 50%; }
.pk-pip-taken { border-color: var(--pk-accent); background: var(--pk-accent); }
/* The room's code, labelled, with Invite (and the host's Show on TV) under it. */
.pk-room-card { display: grid; gap: 0.6em; padding: 0.85em 1em; border: 1px solid var(--pk-accent); border-radius: 16px; background: var(--pk-accent-soft); }
/* A game's own card for the code (codeCard): no gold box around it. */
.pk-room-card-own { padding: 0; border: 0; background: none; }
.pk-room-line { display: flex; align-items: baseline; justify-content: space-between; gap: 1em; }
.pk-room-label { color: var(--pk-accent); font-family: var(--pk-font-digits); font-size: 0.85em; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
.pk-room-code { color: var(--pk-accent); font-family: var(--pk-font-digits); font-size: 2em; letter-spacing: 0.06em; font-variant-numeric: tabular-nums; white-space: nowrap; }
.pk-room-tools { display: grid; grid-template-columns: repeat(auto-fit, minmax(7em, 1fr)); gap: 0.5em; }
.pk-room-tools .pk-tool { flex-direction: row; min-height: 48px; }
/* Why Start waits, in grey: a room still filling isn't an error. */
.pk-problems-calm .pk-problem { color: var(--pk-text-dim); }
.pk-host { display: grid; gap: 0.75em; padding: 1em; border: 1px solid var(--pk-rule); border-radius: 16px; background: var(--pk-panel); }
.pk-tools { display: grid; grid-template-columns: repeat(auto-fit, minmax(7em, 1fr)); gap: 0.5em; }
.pk-tool {
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.3em; min-height: 64px;
  padding: 0.5em; border: 1px solid var(--pk-rule); border-radius: 12px; background: var(--pk-card); cursor: var(--cursor-link, pointer);
}
.pk-tool[aria-pressed="true"] { border-color: var(--pk-accent); }
.pk-consent { display: grid; gap: 0.75em; padding: 1em; border-top: 2px solid var(--pk-line); background: var(--pk-panel); }

/* Ads (ui/ads): a banner's place, its space kept from the first frame, well below the controls */
.pk-ad { display: grid; justify-items: center; gap: 0.35em; margin-top: 2em; }
.pk-ad-label { font-size: 0.75em; letter-spacing: 0.08em; text-transform: uppercase; color: var(--pk-text-dim); }
.pk-ad-box { width: 320px; max-width: 100%; height: 50px; overflow: hidden; }
.pk-ad-mock {
  display: grid; place-items: center; height: 100%; padding: 0 0.5em; border: 1px dashed var(--pk-rule); border-radius: 8px;
  font-size: 0.75em; line-height: 1.2; color: var(--pk-text-dim); text-align: center;
}
.pk-ad-hold { display: flex; align-items: center; gap: 0.5em; }
/* The Host Pass offer (lobby/phone-lobby.tsx): a card among the host's tools while the TV plays its video */
.pk-pass-nudge { display: grid; gap: 0.6em; padding: 0.9em 1em; border: 1px solid var(--pk-accent); border-radius: 14px; background: var(--pk-card); }
.pk-pass-lines { display: grid; gap: 0.35em; list-style: none; }
.pk-pass-line { display: flex; align-items: flex-start; gap: 0.5em; }
.pk-pass-line .pk-icon { margin-top: 0.15em; color: var(--pk-accent); }
/* The store (store/store-screen.tsx): a sheet with Sets, Looks and Host Pass tabs; each list scrolls in its own box
   (fade-list.tsx), a card a set or a pass or the supporter pack, a row a look. */
.pk-store-balance { font-weight: 600; }
.pk-store-signin { display: grid; gap: 0.6em; padding: 0.8em 1em; border: 1px solid var(--pk-accent); border-radius: 14px; background: var(--pk-card); }
.pk-store-list { list-style: none; display: grid; gap: 0.6em; }
.pk-store-item { display: grid; gap: 0.5em; padding: 0.8em 0.9em; border: 1px solid var(--pk-rule); border-radius: 14px; background: var(--pk-card); }
.pk-store-head { display: flex; align-items: baseline; justify-content: space-between; gap: 0.8em; }
.pk-store-name { margin: 0; font-size: 1.05em; font-weight: 700; line-height: 1.25; }
.pk-store-price { color: var(--pk-accent); font-weight: 700; font-variant-numeric: tabular-nums; white-space: nowrap; }
.pk-store-fine { font-size: 0.82em; }
.pk-store-yours { display: inline-flex; align-items: center; gap: 0.35em; color: var(--pk-accent); font-weight: 700; }
.pk-store-parts { list-style: none; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0.5em; }
.pk-store-parts > li { display: grid; justify-items: center; align-content: start; gap: 0.25em; text-align: center; }
.pk-store-part-name { font-size: 0.78em; line-height: 1.2; overflow-wrap: anywhere; }
.pk-look-pic { display: block; width: 100%; max-width: 4.5em; aspect-ratio: 1; border: 1px solid var(--pk-rule); border-radius: 10px; object-fit: cover; background: var(--pk-panel); }
.pk-store-look { grid-template-columns: 3.4em minmax(0, 1fr) auto; align-items: center; gap: 0.7em; }
.pk-store-look .pk-look-pic { max-width: none; }
.pk-store-words { display: grid; gap: 0.1em; min-width: 0; justify-items: start; }
.pk-root .pk-store-action { min-height: 44px; padding: 0.35em 1em; font-size: 1em; }

/* Phone shell */
.pk-root.pk-phone { min-height: 100vh; font-size: calc(1.0625em * var(--pk-scale, 1)); }
.pk-phone-frame { display: flex; flex-direction: column; min-height: 100vh; }
/* The top bar and the step's header stay at the top together while the task card scrolls. */
.pk-phone-head { position: sticky; top: 0; z-index: 5; }
.pk-topbar {
  display: flex; align-items: center; gap: 0.6em; min-height: 3.2em;
  padding: 0.3em 0.4em 0.3em 0.9em; border-bottom: 1px solid var(--pk-rule); background: var(--pk-panel);
}
/* Its own class, not the stepper's .pk-step: sharing it made the header a 48 px circle, its words spilling out. */
.pk-phone-step {
  position: relative; display: grid; justify-items: start; gap: 0.3em; min-width: 0; padding: 0.55em 0.9em 0.65em;
  border-bottom: 1px solid var(--pk-rule); background: var(--pk-panel);
}
/* The step's own time, running down along the header's foot, the same on every phone. */
.pk-step-time { position: absolute; bottom: -1px; left: 0; height: 3px; background: var(--pk-accent); transition: width 0.5s linear; }
.pk-calm .pk-step-time { transition: none; }
/* The host's Pause, round in the top bar; while paused, a band with Resume. */
.pk-root .pk-topbar-pause {
  display: inline-flex; align-items: center; justify-content: center; flex: none; width: 44px; height: 44px; padding: 0;
  border: 2px solid var(--pk-accent); border-radius: 50%; background: none; color: var(--pk-accent); cursor: var(--cursor-link, pointer);
}
.pk-paused {
  display: flex; align-items: center; gap: 0.6em; padding: 0.45em 0.9em; border-bottom: 1px solid var(--pk-rule);
  background: linear-gradient(var(--pk-accent-soft), var(--pk-accent-soft)), var(--pk-panel); color: var(--pk-accent); font-weight: 700;
}
.pk-paused > span { flex: 1; }
.pk-paused .pk-btn { min-height: 40px; padding: 0.3em 1em; font-size: 1em; }
.pk-step-title { max-width: 100%; font-size: 1.2em; line-height: 1.15; overflow-wrap: break-word; text-wrap: balance; }
/* A phone still to act, in a timed step's last 10 s: the header pulses in the accent (steady with calmer motion). */
.pk-phone-step-alert { animation: pk-step-alert 1s ease-in-out infinite; }
@keyframes pk-step-alert { 50% { background: var(--pk-accent-soft); box-shadow: inset 0 -3px 0 var(--pk-accent); } }
.pk-calm .pk-phone-step-alert { background: var(--pk-accent-soft); box-shadow: inset 0 -3px 0 var(--pk-accent); }
.pk-topbar-me { display: flex; flex: 1; align-items: center; gap: 0.75em; min-width: 0; }
.pk-topbar-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pk-topbar-timer { display: inline-flex; align-items: center; gap: 0.25em; font-variant-numeric: tabular-nums; font-weight: 700; }
.pk-urgent { color: var(--pk-accent); }
.pk-dot { display: inline-flex; align-items: center; justify-content: center; width: 1.4em; height: 1.4em; color: var(--pk-danger); }
.pk-dot-online::before { content: ""; width: 0.65em; height: 0.65em; border-radius: 50%; background: var(--pk-good); }
/* The phone's notices (not .pk-banner: that's the TV's gold A+ banner, and it made "the game ended" a headline). */
.pk-notice, .pk-tip { display: flex; align-items: center; gap: 0.5em; padding: 0.55em 0.9em; background: var(--pk-card); border-bottom: 1px solid var(--pk-rule); }
.pk-notice-row { justify-content: space-between; }
.pk-tip { color: var(--pk-text-dim); font-size: 0.92em; }
.pk-tabs { display: flex; border-bottom: 1px solid var(--pk-rule); }
.pk-root .pk-tab {
  display: flex; flex: 1; align-items: center; justify-content: center; gap: 0.4em; min-height: 48px;
  border: 0; border-bottom: 3px solid transparent; background: none; color: var(--pk-text-dim); cursor: var(--cursor-link, pointer);
}
.pk-root .pk-tab[aria-selected="true"] { border-bottom-color: var(--pk-accent); color: var(--pk-text); font-weight: 700; }
.pk-phone-body { flex: 1; padding: 1em 1.1em; touch-action: pan-y pinch-zoom; }
.pk-table, .pk-tab-panel { display: grid; gap: 1em; }
.pk-phone-foot { position: sticky; bottom: 0; z-index: 5; background: var(--pk-panel); }
.pk-action-bar {
  display: flex; gap: 0.6em; padding: 0.7em 0.9em; padding-bottom: calc(0.7em + env(safe-area-inset-bottom, 0px));
  border-top: 1px solid var(--pk-rule);
}
.pk-action-bar > * { flex: 1; }
.pk-caption-log { list-style: none; display: grid; gap: 0.35em; color: var(--pk-text-dim); font-style: italic; }
/* The narrator's words on a phone that asked for them, as a film's subtitles: over the foot of the screen while the
   line is said, then gone, so the screen never jumps or loses rows to them (George, 27 Oct 2026: "narrator words ruin
   layout"; "The lyrics must be shown as subs in movie and then dissapear when voice stops"). */
/* George's look (27 Oct: "subs must be shown at very bottom ... on a blue 80% alpha bakckground, our yellow colors with
   gfradient alpha blur fade out on top", in the game's own face, italic): a band flush on the foot, the theme's panel
   at 80% behind a blur, both fading out towards the top, and the line in the accent. */
.pk-phone .pk-captions {
  position: absolute; right: 0; bottom: 100%; left: 0; padding: 1.5em 1em 0.55em; text-align: center; pointer-events: none;
  background: linear-gradient(to bottom, rgba(var(--pk-panel-rgb), 0), rgba(var(--pk-panel-rgb), 0.8) 1.4em);
  -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px);
  -webkit-mask-image: linear-gradient(to bottom, transparent, #000 1.4em); mask-image: linear-gradient(to bottom, transparent, #000 1.4em);
}
.pk-phone .pk-captions:empty { display: none; }
.pk-phone .pk-caption { margin: 0; color: var(--pk-accent); font-family: var(--pk-font-ui); font-style: italic; font-weight: 500; line-height: 1.4; }
.pk-hold {
  position: relative; display: flex; align-items: center; justify-content: center; width: 72%; max-width: 20em;
  margin: 1em auto; aspect-ratio: 5 / 7; overflow: hidden; border: 2px solid var(--pk-line); border-radius: 18px;
  background: var(--pk-card); cursor: var(--cursor-link, pointer); touch-action: none; user-select: none; -webkit-user-select: none;
  -webkit-touch-callout: none;
}
.pk-hold-back {
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.6em; width: 100%;
  height: 100%; padding: 1em; text-align: center; color: var(--pk-text-dim);
  background: repeating-linear-gradient(45deg, transparent 0, transparent 9px, rgba(239, 231, 212, 0.07) 9px, rgba(239, 231, 212, 0.07) 10px);
}
.pk-hold-back .pk-icon { width: 2.5em; height: 2.5em; }
.pk-hold-face { width: 100%; height: 100%; }
/* What opens under a head (ui/expand.tsx): a box of its own, so its children's margins stay inside it, clipped while it
   grows or shrinks. */
.pk-expand { display: flow-root; }
.pk-expand[hidden] { display: none; }
.pk-expand-moving { overflow: hidden; }
.pk-drawer { position: relative; }
.pk-root .pk-drawer-handle {
  position: relative; display: flex; align-items: center; justify-content: center; gap: 0.5em; width: 100%;
  min-height: 52px; border: 0; border-top: 1px solid var(--pk-rule); background: var(--pk-panel);
  color: var(--pk-text-dim); cursor: var(--cursor-link, pointer); touch-action: none; user-select: none; -webkit-user-select: none;
  -webkit-touch-callout: none;
}
.pk-holding::after { content: ""; position: absolute; left: 0; bottom: 0; height: 3px; background: var(--pk-accent); animation: pk-fill 0.6s linear forwards; }
@keyframes pk-fill { from { width: 0; } to { width: 100%; } }
/* A tap let go too soon: the handle bobs and says to hold it, in the accent, for a moment. */
.pk-root .pk-drawer-handle.pk-nudged { color: var(--pk-accent); }
.pk-nudged > .pk-icon, .pk-drawer-hint { animation: pk-nudge 0.55s ease-out; }
.pk-drawer-hint { font-weight: 600; text-align: center; }
@keyframes pk-nudge { 0%, 100% { transform: none; } 35% { transform: translateY(-5px); } 65% { transform: translateY(2px); } }
/* The same size on every phone; its body fills it, so a game's action can sit at its foot and "nothing to do" in its
   middle. */
.pk-drawer-open {
  display: flex; flex-direction: column; min-height: 40vh; padding: 0.4em 0.9em 1em; border-top: 2px solid var(--pk-line);
  background: var(--pk-panel);
}
.pk-drawer-head { display: flex; align-items: center; justify-content: space-between; }
.pk-drawer-title { font-weight: 700; }
.pk-drawer-body { display: flex; flex: 1; flex-direction: column; gap: 0.75em; padding-top: 0.5em; }
.pk-drawer-none { display: flex; flex: 1; align-items: center; justify-content: center; text-align: center; }
/* The room's code, at the top of the phone's menu. */
.pk-menu-room {
  display: flex; align-items: center; justify-content: space-between; gap: 1em; padding: 0.7em 0.9em; border: 1px solid var(--pk-accent);
  border-radius: 12px; background: var(--pk-accent-soft);
}
.pk-menu-room .pk-help { display: block; }
.pk-menu-code { color: var(--pk-accent); font-family: var(--pk-font-digits); font-size: 1.5em; letter-spacing: 0.06em; white-space: nowrap; }
/* VHub's answer on the end screen (phone/end-progress.tsx): a card in the task area, the bar a transform (cheap on old
   phones). The bronze, silver and gold are VHub's own tier colours. */
.pk-progress {
  display: grid; gap: 0.7em; padding: 1em 1.1em; border: 1px solid var(--pk-rule); border-radius: 16px;
  background: var(--pk-card);
}
.pk-progress-waiting { display: flex; align-items: center; gap: 0.6em; color: var(--pk-text-dim); }
.pk-progress-eyebrow { color: var(--pk-text-dim); font-size: 0.85em; font-weight: 600; letter-spacing: 0.04em; }
.pk-progress-xp { font-family: var(--pk-font-digits); font-size: 2.1em; font-weight: 700; line-height: 1.1; color: var(--pk-accent); font-variant-numeric: tabular-nums; }
.pk-progress-xp-none { font-family: var(--pk-font-ui); font-size: 1.15em; color: var(--pk-text); }
.pk-progress-coins { font-size: 1.15em; font-weight: 700; color: var(--pk-accent); font-variant-numeric: tabular-nums; }
.pk-progress-level { display: grid; gap: 0.35em; }
.pk-progress-level-row { display: flex; align-items: center; justify-content: space-between; gap: 0.6em; min-height: 1.8em; }
.pk-progress-level-name { font-weight: 700; }
.pk-progress-up {
  padding: 0.15em 0.7em; border: 1.5px solid var(--pk-accent); border-radius: 999px; color: var(--pk-accent);
  font-size: 0.9em; font-weight: 700; animation: pk-pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
.pk-xp-bar {
  position: relative; height: 0.8em; overflow: hidden; border: 1px solid var(--pk-line); border-radius: 999px;
  background: rgba(var(--pk-text-rgb), 0.06);
}
.pk-xp-fill {
  position: absolute; top: 0; left: 0; bottom: 0; width: 100%; background: var(--pk-accent); transform-origin: left center;
  transition: transform 0.9s cubic-bezier(0.22, 1, 0.36, 1);
}
.pk-xp-bar.is-jump .pk-xp-fill { transition: none; }
.pk-progress-ach { display: grid; gap: 0.4em; padding-top: 0.3em; }
.pk-root .pk-ach-list { list-style: none; display: grid; }
.pk-ach { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 0.75em; padding: 0.55em 0; border-top: 1px solid var(--pk-rule); }
.pk-ach-icon {
  --pk-tier: var(--pk-accent);
  display: inline-flex; align-items: center; justify-content: center; width: 2.6em; height: 2.6em;
  border: 1.5px solid var(--pk-tier); border-radius: 50%; color: var(--pk-tier);
  animation: pk-pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
.pk-ach-icon[data-tier="bronze"] { --pk-tier: #B87333; }
.pk-ach-icon[data-tier="silver"] { --pk-tier: #9AA6B2; }
.pk-ach-icon[data-tier="gold"] { --pk-tier: #F4C430; }
.pk-ach-icon .pk-icon { width: 1.4em; height: 1.4em; }
.pk-ach-coin {
  display: block; width: 2.6em; height: 2.6em; filter: drop-shadow(0 0.08em 0.12em rgba(0, 0, 0, 0.35));
  animation: pk-pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
.pk-ach-words { display: grid; gap: 0.1em; min-width: 0; }
.pk-ach-title { font-weight: 700; }
.pk-ach-about, .pk-ach-tier { color: var(--pk-text-dim); font-size: 0.9em; }
.pk-ach-xp { color: var(--pk-accent); font-weight: 700; white-space: nowrap; font-variant-numeric: tabular-nums; }
.pk-progress-signin { display: grid; gap: 0.45em; padding-top: 0.7em; border-top: 1px solid var(--pk-rule); }
.pk-progress-alone .pk-progress-signin { padding-top: 0; border-top: 0; }
.pk-progress-bonus { color: var(--pk-accent); font-weight: 600; }
@keyframes pk-pop { 0% { opacity: 0; transform: scale(0.6); } 100% { opacity: 1; transform: none; } }

/* TV: a 1920x1080 stage with a 5% safe margin; body 36px, names 40px. In A+ (Spotlight with props, George's pick of
   23 Oct 2026) the game's art is the stage, darkened by the moment's shade, and the props of tv/props.tsx sit on it. */
.pk-root.pk-tv { position: fixed; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden; }
.pk-tv-viewport { position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden; background: var(--pk-ground); }
.pk-tv-stage { position: absolute; top: 50%; left: 50%; width: 1920px; height: 1080px; overflow: hidden; transform-origin: 50% 50%; }
.pk-tv-backdrop {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden;
  background:
    repeating-linear-gradient(135deg, rgba(var(--pk-text-rgb), 0.028) 0, rgba(var(--pk-text-rgb), 0.028) 1px, rgba(0, 0, 0, 0) 1px, rgba(0, 0, 0, 0) 14px),
    radial-gradient(ellipse at 50% 38%, var(--pk-card), var(--pk-ground) 72%);
}
.pk-tv-art {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-position: center; background-repeat: no-repeat;
  background-size: cover; animation: pk-drift 40s ease-in-out infinite alternate; will-change: transform;
}
.pk-tv-shade { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
.pk-mood-lobby .pk-tv-shade { background: linear-gradient(180deg, rgba(var(--pk-ground-rgb), 0.2), rgba(var(--pk-ground-rgb), 0.38) 42%, rgba(var(--pk-ground-rgb), 0.9) 70%, var(--pk-ground)); }
.pk-mood-play .pk-tv-shade { background: radial-gradient(ellipse 70% 62% at 50% 46%, rgba(var(--pk-ground-rgb), 0.62), rgba(var(--pk-ground-rgb), 0.9) 72%), linear-gradient(180deg, rgba(0, 0, 0, 0) 60%, var(--pk-ground)); }
.pk-mood-night .pk-tv-shade { background: linear-gradient(180deg, rgba(4, 9, 22, 0.35), rgba(4, 9, 22, 0.62) 62%, rgba(var(--pk-ground-rgb), 0.94)); }
.pk-mood-day .pk-tv-shade { background: linear-gradient(180deg, rgba(38, 24, 8, 0.28), rgba(var(--pk-ground-rgb), 0.55) 55%, rgba(var(--pk-ground-rgb), 0.92)); }
.pk-mood-reveal .pk-tv-shade, .pk-mood-end .pk-tv-shade { background: radial-gradient(ellipse 70% 60% at 50% 45%, rgba(var(--pk-ground-rgb), 0.7), rgba(var(--pk-ground-rgb), 0.93) 72%); }
.pk-tv-frame { position: absolute; top: 54px; right: 96px; bottom: 54px; left: 96px; display: flex; flex-direction: column; font-size: 36px; line-height: 1.3; }
/* The top bar: the logo, the stopwatch in the middle, the join panel; below it the scenes have the frame's whole width. */
.pk-tv-top {
  position: relative; z-index: 3; display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); align-items: start; gap: 48px;
  min-height: 140px;
}
.pk-tv-top > .pk-tv-corner { justify-self: end; }
.pk-tv-top > .pk-tv-watch { grid-column: 2; }
.pk-tv-heading { font-family: var(--pk-font-display); font-stretch: var(--pk-display-stretch); font-size: 96px; line-height: 1.05; text-transform: uppercase; text-shadow: 0 4px 24px rgba(0, 0, 0, 0.5); }
.pk-tv-corner { display: flex; align-items: center; gap: 36px; }
.pk-tv-join { display: flex; align-items: center; gap: 20px; padding: 14px 28px; border-radius: 22px; background: rgba(var(--pk-panel-rgb), 0.9); }
.pk-tv-join-qr { padding-left: 14px; }
.pk-tv-join-text { display: flex; flex-direction: column; }
.pk-tv-join-url { color: var(--pk-text-dim); font-size: 32px; line-height: 1.2; }
.pk-tv-join-code { color: var(--pk-text); font-family: var(--pk-font-digits); font-size: 56px; line-height: 1.05; font-variant-numeric: tabular-nums; white-space: nowrap; }
.pk-tv-centre { display: flex; flex: 1; flex-direction: column; justify-content: center; min-height: 0; }
/* A scene laid out on the whole frame (the lobby, the verdict, the truth): 1728x972 from the stage's 96,54. */
.pk-tv-fill { position: absolute; top: 0; right: 0; bottom: 0; left: 0; }
.pk-tv .pk-captions { position: relative; z-index: 2; display: flex; align-items: flex-end; justify-content: center; min-height: 120px; text-align: center; }
.pk-tv .pk-caption { max-width: 1500px; padding: 10px 32px; border-radius: 14px; background: rgba(0, 0, 0, 0.5); font-size: 40px; font-style: italic; }
.pk-tv .pk-captions-large .pk-caption { font-size: 58px; }
/* The frame's width and no more: the column won't grow to the tiles' 190 px each, so from 10 players they shrink to fit
   (a row of 14 had run 2816 px wide, off the stage). */
.pk-strip { position: relative; z-index: 2; display: grid; grid-template-columns: minmax(0, 1fr); gap: 12px; margin-top: 6px; }
.pk-strip-row { display: flex; justify-content: center; gap: 16px; min-width: 0; list-style: none; }
.pk-strip-row > li { flex: 0 1 240px; min-width: 0; }
/* Portraits to read from the sofa (George, 26 Oct 2026: "Figures are way too small"): 128 px up to 8 across, then as
   big as the tiles allow, with a thin ring; each status on one line (a long one ends in "…"). */
.pk-tv .pk-tile { font-size: 36px; gap: 6px; }
.pk-tv .pk-tile .pk-avatar {
  width: 128px; height: 128px; font-size: 54px; border: 2px solid rgba(var(--pk-accent-rgb), 0.85);
  background: radial-gradient(circle at 50% 30%, var(--pk-card), var(--pk-panel) 75%);
  box-shadow: 0 0 0 3px var(--pk-ground), 0 0 0 5px rgba(var(--pk-accent-rgb), 0.3);
}
.pk-tv .pk-tile .pk-ranked { border: 0; box-shadow: none; }
.pk-tv .pk-strip-two .pk-tile .pk-avatar { width: 88px; height: 88px; font-size: 40px; }
/* Closer tiles as more sit across (stripDensity), the portraits as big as each tile allows (about 165, 138 and 118 px
   wide at 10, 12 and 14 across); a long name takes a smaller font only when it needs it (useFitText). */
.pk-tv .pk-strip-snug .pk-strip-row { gap: 8px; }
.pk-tv .pk-strip-snug .pk-tile .pk-avatar { width: 124px; height: 124px; font-size: 52px; }
.pk-tv .pk-strip-snug .pk-tile-name { padding: 3px 8px 1px; font-size: 32px; }
.pk-tv .pk-strip-tight .pk-strip-row, .pk-tv .pk-strip-dense .pk-strip-row { gap: 6px; }
.pk-tv .pk-strip-tight .pk-tile .pk-avatar { width: 116px; height: 116px; font-size: 48px; }
.pk-tv .pk-strip-tight .pk-tile-name { padding: 3px 8px 1px; font-size: 30px; }
.pk-tv .pk-strip-dense .pk-tile .pk-avatar { width: 104px; height: 104px; font-size: 44px; }
.pk-tv .pk-strip-dense .pk-tile-name { padding: 3px 6px 1px; font-size: 28px; }
.pk-tv .pk-tile-name {
  padding: 3px 14px 1px; border-radius: 4px; background: var(--pk-face); color: var(--pk-face-ink); font-weight: 700;
  line-height: 1.15; transform: rotate(-2deg); box-shadow: 0 6px 0 rgba(0, 0, 0, 0.28);
}
.pk-tv .pk-tile-out .pk-avatar { opacity: 0.4; border-color: rgba(var(--pk-text-rgb), 0.3); filter: grayscale(1); }
.pk-tv .pk-tile-out .pk-tile-name { opacity: 1; background: rgba(var(--pk-text-rgb), 0.3); color: var(--pk-text-dim); }
.pk-tv .pk-tile-badges { max-width: 100%; gap: 2px 12px; font-family: var(--pk-font-digits); font-size: 22px; letter-spacing: 0.02em; text-transform: uppercase; }
.pk-tv .pk-badge { max-width: 100%; overflow: hidden; white-space: nowrap; }
.pk-tv .pk-badge-word { overflow: hidden; text-overflow: ellipsis; }
.pk-tv .pk-tile-badges .pk-icon { width: 26px; height: 26px; }
.pk-tv .pk-level { font-size: 24px; }
.pk-ring { position: relative; display: inline-flex; align-items: center; justify-content: center; width: 150px; height: 150px; flex: none; }
.pk-ring-svg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
.pk-ring-track { fill: none; stroke: var(--pk-rule); stroke-width: 6; }
.pk-ring-left { fill: none; stroke: var(--pk-accent); stroke-width: 6; stroke-linecap: round; transition: stroke-dashoffset 0.25s linear; }
.pk-ring-text { position: relative; display: inline-flex; align-items: center; gap: 6px; font-family: var(--pk-font-digits); font-size: 44px; font-variant-numeric: tabular-nums; }
.pk-ring-urgent { animation: pk-pulse 1s ease-in-out infinite; }
.pk-ring-paused .pk-ring-left { stroke: var(--pk-text-dim); }
@keyframes pk-pulse { 50% { transform: scale(1.06); } }
.pk-qr { display: block; }
.pk-qr-light { fill: var(--pk-text); }
.pk-qr-dark { fill: var(--pk-ground); }
.pk-qr-small { width: 124px; height: 124px; border-radius: 10px; }
.pk-qr-big { width: 266px; height: 266px; border-radius: 14px; }
.pk-qr-invite { width: 220px; height: 220px; margin: 0 auto; }
.pk-invite-link { font-size: 1em; }
.pk-tv-paused, .pk-tv-banner {
  position: absolute; z-index: 4; top: 150px; left: 50%; display: flex; align-items: center; gap: 16px; padding: 14px 40px;
  border: 2px solid var(--pk-accent); border-radius: 16px; background: var(--pk-panel); font-size: 48px;
  transform: translateX(-50%);
}
.pk-tv-banner { top: auto; bottom: 20px; border-color: var(--pk-danger); font-size: 36px; }
.pk-tv .pk-btn { min-height: 88px; padding: 0 48px; border-radius: 18px; font-size: 40px; }
.pk-tv .pk-icon { width: 1.1em; height: 1.1em; }
/* Its own row under the middle (George, 28 Oct 2026: "Button hides message behind on tv"): the middle gives it room, so
   the scene's message sits above it on any screen, the stage being 1920x1080 scaled. */
.pk-tv-sound { position: relative; z-index: 5; flex: none; align-self: center; margin-top: 24px; }
/* A TV's start screen (tv/code-entry.tsx): the TV code typed with the remote, in twelve boxes and threes, the keys on the
   screen for the arrows, and a screen's pairing code with its QR to the game's demo. */
.pk-tv-code-digits { display: flex; align-items: center; gap: 8px; }
.pk-tv-code-digit {
  display: flex; align-items: center; justify-content: center; width: 62px; height: 96px; border: 3px solid var(--pk-rule);
  border-radius: 12px; background: var(--pk-panel); font-family: var(--pk-font-digits); font-size: 56px; font-weight: 700; line-height: 1;
  font-variant-numeric: tabular-nums;
}
.pk-tv-code-digit-third { margin-right: 18px; }
.pk-tv-code-digit-next { border-color: var(--pk-accent); box-shadow: 0 0 0 6px rgba(var(--pk-accent-rgb), 0.22); }
.pk-keypad { display: grid; grid-template-columns: 136px 136px 136px; gap: 16px; }
.pk-tv .pk-keypad .pk-key {
  min-height: 108px; padding: 0; border: 2px solid rgba(var(--pk-text-rgb), 0.18); border-radius: 14px;
  background: linear-gradient(var(--pk-card), var(--pk-panel)); box-shadow: inset 0 -6px 0 rgba(0, 0, 0, 0.35), inset 0 2px 0 rgba(255, 255, 255, 0.06);
  font-family: var(--pk-font-digits); font-size: 52px;
}
.pk-tv .pk-keypad .pk-key.pk-btn-primary { border-color: var(--pk-accent); background: var(--pk-accent); color: var(--pk-on-accent); font-weight: 800; }
.pk-tv .pk-keypad .pk-key-word { font-family: var(--pk-font-ui); font-size: 38px; }
.pk-pair { display: flex; align-items: center; gap: 40px; }
.pk-qr-pair { flex: none; width: 300px; height: 300px; border-radius: 16px; }
.pk-pair-text { display: grid; gap: 16px; }
.pk-pair-label { justify-self: start; font-size: 30px; }
.pk-pair-help { max-width: 640px; color: var(--pk-text-dim); font-size: 32px; }
.pk-tv-dialog {
  position: absolute; z-index: 6; top: 50%; left: 50%; display: grid; gap: 40px; min-width: 900px; padding: 48px 64px;
  border: 2px solid var(--pk-line); border-radius: 24px; background: var(--pk-panel); text-align: center;
  transform: translate(-50%, -50%);
}
.pk-tv-dialog-title { font-size: 48px; font-weight: 700; }

/* A+ props (tv/props.tsx) */
.pk-tape {
  display: inline-block; padding: 4px 16px 3px; border-left: 5px solid var(--pk-accent); background: rgba(var(--pk-text-rgb), 0.1);
  color: var(--pk-text); font-family: var(--pk-font-digits); font-size: 32px; line-height: 1.25; letter-spacing: 0.05em;
  text-transform: uppercase; white-space: nowrap;
}
/* On a phone the tape labels a step, a line above its question: the TV's 32 px would be a headline there. */
.pk-phone .pk-tape { padding: 0.2em 0.65em 0.15em; border-left-width: 4px; font-size: 0.8em; }
.pk-root[lang="el"] .pk-tape, .pk-root[lang="el"] .pk-stamp, .pk-root[lang="el"] .pk-banner { letter-spacing: 0.02em; }
.pk-stamp {
  display: inline-block; padding: 2px 14px; border: 4px solid currentColor; border-radius: 8px; background: rgba(var(--pk-ground-rgb), 0.55);
  color: var(--pk-stamp); font-family: var(--pk-font-digits); font-weight: 700; line-height: 1.2; letter-spacing: 0.05em;
  text-transform: uppercase; white-space: nowrap; transform: rotate(-12deg); animation: pk-stamp-in 0.45s ease-out both;
}
.pk-stamp-accent { color: var(--pk-accent); }
.pk-frm { position: relative; border: 2px solid var(--pk-accent); background: rgba(var(--pk-panel-rgb), 0.92); }
.pk-frm::before {
  content: ""; position: absolute; top: 8px; right: 8px; bottom: 8px; left: 8px; border: 1px solid rgba(var(--pk-accent-rgb), 0.45);
  pointer-events: none;
}
.pk-cn {
  position: absolute; z-index: 2; width: 56px; height: 56px; background: var(--pk-accent); pointer-events: none;
  -webkit-mask: ${ut} center / contain no-repeat; mask: ${ut} center / contain no-repeat;
}
.pk-cn-tl { top: -2px; left: -2px; }
.pk-cn-tr { top: -2px; right: -2px; transform: scaleX(-1); }
.pk-cn-bl { bottom: -2px; left: -2px; transform: scaleY(-1); }
.pk-cn-br { right: -2px; bottom: -2px; transform: scale(-1, -1); }
.pk-ticket {
  position: relative; display: flex; border-radius: 20px; background: rgba(var(--pk-panel-rgb), 0.95); --pk-stub: 330px;
  -webkit-mask: radial-gradient(circle at var(--pk-stub) 0, rgba(0, 0, 0, 0) 26px, #000 27px) top / 100% 51% no-repeat, radial-gradient(circle at var(--pk-stub) 100%, rgba(0, 0, 0, 0) 26px, #000 27px) bottom / 100% 51% no-repeat;
  mask: radial-gradient(circle at var(--pk-stub) 0, rgba(0, 0, 0, 0) 26px, #000 27px) top / 100% 51% no-repeat, radial-gradient(circle at var(--pk-stub) 100%, rgba(0, 0, 0, 0) 26px, #000 27px) bottom / 100% 51% no-repeat;
}
.pk-ticket::after {
  content: ""; position: absolute; top: 14px; right: 14px; bottom: 14px; left: 14px; border: 1.5px solid rgba(var(--pk-accent-rgb), 0.4);
  border-radius: 12px; pointer-events: none;
}
/* The stub keeps what it holds 22px clear of the frame (14px in, 1.5px wide) and of the tear line alike; words too wide
   for it wrap rather than run over either line (George, 28 Oct: vgraphics.gr/tv touched the frame). The lobby's 266px QR
   fills its 330px stub exactly. */
.pk-ticket-stub {
  display: flex; flex: none; flex-direction: column; align-items: center; justify-content: center; gap: 14px; width: var(--pk-stub);
  padding: 0 22px 0 38px; border-right: 4px dotted rgba(var(--pk-text-rgb), 0.28); text-align: center; overflow-wrap: anywhere;
}
.pk-ticket-main { display: flex; flex: 1; flex-direction: column; align-items: flex-start; justify-content: center; gap: 12px; min-width: 0; padding: 30px 32px; }
.pk-cells { display: inline-flex; gap: 10px; }
.pk-cell {
  display: inline-flex; align-items: center; justify-content: center; width: 62px; height: 90px; border: 2px solid rgba(var(--pk-text-rgb), 0.3);
  border-radius: 8px; background: var(--pk-panel); color: var(--pk-text); font-family: var(--pk-font-digits); font-size: 62px;
  font-weight: 700; line-height: 1; font-variant-numeric: tabular-nums;
}
.pk-cell-gap { margin-left: 14px; }
.pk-tag {
  display: inline-block; max-width: 100%; padding: 3px 14px 1px; overflow: hidden; border-radius: 4px; background: var(--pk-face);
  color: var(--pk-face-ink); font-family: var(--pk-font-names); font-size: 38px; font-weight: 700; line-height: 1.15;
  text-overflow: ellipsis; white-space: nowrap; transform: rotate(-2deg); box-shadow: 0 6px 0 rgba(0, 0, 0, 0.28);
}
.pk-tag-big { font-size: 46px; }
.pk-tag-blank {
  border: 2px dashed rgba(var(--pk-text-rgb), 0.3); background: none; color: var(--pk-text-dim); font-size: 30px; font-weight: 600;
  line-height: 1.1; text-align: center; white-space: normal; transform: none; box-shadow: none;
}
.pk-tag-out { background: rgba(var(--pk-text-rgb), 0.3); color: var(--pk-text-dim); text-decoration: line-through; }
.pk-med {
  position: relative; display: inline-flex; flex: none; align-items: center; justify-content: center; border: 2px solid rgba(var(--pk-accent-rgb), 0.85);
  border-radius: 50%; background: radial-gradient(circle at 50% 30%, var(--pk-card), var(--pk-panel) 75%);
  box-shadow: 0 0 0 5px var(--pk-ground), 0 0 0 7px rgba(var(--pk-accent-rgb), 0.35);
}
.pk-med .pk-med-face { width: 100%; height: 100%; border: 0; background: none; font-size: 1em; }
.pk-med .pk-avatar-art { background: radial-gradient(circle at 50% 36%, rgba(var(--pk-accent-rgb), 0.24), var(--pk-card) 66%); }
.pk-med-out { border-color: rgba(var(--pk-text-rgb), 0.3); }
.pk-med-out .pk-med-face { opacity: 0.55; filter: grayscale(1); }
/* A VHub player's rank frame takes the place of the gold ring. */
.pk-med-ranked { border-color: transparent; background: none; box-shadow: none; }
.pk-med-ok {
  position: absolute; right: -5%; bottom: -5%; display: flex; align-items: center; justify-content: center; width: 36%; height: 36%;
  border-radius: 50%; background: var(--pk-accent); color: var(--pk-on-accent); box-shadow: 0 0 0 4px var(--pk-ground);
}
.pk-med-ok .pk-icon { width: 62%; height: 62%; stroke-width: 3; }
.pk-med-crown { position: absolute; top: -34%; left: 50%; display: flex; width: 46%; height: 30%; margin-left: -23%; color: var(--pk-accent); }
.pk-med-crown .pk-icon { width: 100%; height: 100%; stroke-width: 1.6; }
/* Out: a gold-edged pill at the top right, past the circle (it starts where the circle has curved away). */
.pk-med-gone {
  position: absolute; top: -4%; left: 74%; display: flex; align-items: center; gap: 0.25em; padding: 0.14em 0.55em 0.1em 0.3em;
  border: 2px solid var(--pk-accent); border-radius: 999px; background: var(--pk-panel); color: var(--pk-text); font-family: var(--pk-font-digits);
  font-size: max(18px, 0.28em); font-style: normal; font-weight: 700; line-height: 1.1; letter-spacing: 0.04em; text-transform: uppercase;
  white-space: nowrap; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.45);
}
.pk-med-gone .pk-icon { width: 1.1em; height: 1.1em; color: var(--pk-danger); stroke-width: 2.4; }
.pk-med-empty { border: 2px dashed rgba(var(--pk-text-rgb), 0.3); background: none; box-shadow: none; color: rgba(var(--pk-text-rgb), 0.45); }
.pk-med-empty .pk-icon { width: 40%; height: 40%; }
.pk-seal {
  display: flex; align-items: center; justify-content: center; width: 78px; height: 78px; border-radius: 50%; background: var(--pk-stamp);
  color: var(--pk-ground); box-shadow: inset 0 0 0 4px rgba(0, 0, 0, 0.18), 0 4px 10px rgba(0, 0, 0, 0.4); transform: rotate(-12deg);
  animation: pk-seal-in 0.5s ease-out both;
}
.pk-seal .pk-icon { width: 44px; height: 44px; stroke-width: 2.2; }
.pk-live-dot { display: inline-block; flex: none; width: 16px; height: 16px; border-radius: 50%; background: var(--pk-accent); animation: pk-breathe 2.4s ease-in-out infinite; }

/* The stopwatch: the step's countdown, on the stage's left (the shell's) */
.pk-watch { position: relative; width: 250px; height: 290px; transform: rotate(-8deg); }
/* On the TV, in the top bar: a small dial with the time beside it in big digits, readable from the sofa. */
.pk-tv-watch { display: flex; align-items: center; gap: 20px; width: auto; height: 140px; transform: none; }
.pk-tv-watch .pk-watch-svg { flex: none; width: 112px; height: 130px; transform: rotate(-8deg); }
.pk-tv-watch .pk-watch-time {
  position: static; color: var(--pk-text); font-size: 84px; text-shadow: 0 4px 18px rgba(0, 0, 0, 0.6);
}
.pk-tv-watch .pk-watch-time .pk-icon { width: 60px; height: 60px; }
.pk-tv-watch.pk-watch-urgent { animation: pk-tick-flat 1s ease-in-out infinite; }
.pk-tv-watch.pk-watch-urgent .pk-watch-time { color: var(--pk-danger); }
@keyframes pk-tick-flat { 0%, 100% { transform: none; } 12% { transform: scale(1.05); } }
.pk-watch-svg { display: block; width: 100%; height: 100%; overflow: visible; }
.pk-watch-line, .pk-watch-rim { fill: none; stroke: var(--pk-accent); stroke-width: 5; }
.pk-watch-face { fill: var(--pk-face); }
.pk-watch-ticks line { stroke: var(--pk-face-ink); stroke-width: 2.2; }
.pk-watch-hand { transform-origin: 125px 165px; transition: transform 0.25s linear; }
.pk-watch-hand line { stroke: var(--pk-danger); stroke-width: 5; stroke-linecap: round; }
.pk-watch-hub { fill: var(--pk-face-ink); }
.pk-watch-time {
  position: absolute; top: 196px; right: 0; left: 0; display: flex; align-items: center; justify-content: center; gap: 4px;
  color: var(--pk-face-ink); font-family: var(--pk-font-digits); font-size: 42px; font-weight: 700; line-height: 1;
  font-variant-numeric: tabular-nums;
}
.pk-watch-time .pk-icon { width: 34px; height: 34px; }
.pk-watch-urgent { animation: pk-tick 1s ease-in-out infinite; }
.pk-watch-urgent .pk-watch-rim { stroke: var(--pk-danger); }
.pk-watch-paused .pk-watch-hand line { stroke: var(--pk-text-dim); }

/* The role card (tv/cards.tsx): a width on the stage, 1.4 times as tall; its words follow its font size */
.pk-rc {
  position: relative; display: block; overflow: hidden; border: 2px solid var(--pk-accent); border-radius: 0.14em; background: var(--pk-panel);
  color: var(--pk-text); line-height: 1.1; text-align: center;
}
.pk-rc::before {
  content: ""; position: absolute; z-index: 2; top: 3%; right: 4%; bottom: 3%; left: 4%; border: 1px solid rgba(var(--pk-accent-rgb), 0.5);
  pointer-events: none;
}
.pk-rc-danger { border-color: var(--pk-danger); }
.pk-rc-danger::before { border-color: rgba(var(--pk-danger-rgb), 0.5); }
.pk-rc-danger .pk-cn { background: var(--pk-danger); }
.pk-rc .pk-cn { width: 1.45em; height: 1.45em; }
.pk-rc-art { position: absolute; top: 3%; left: 4%; display: block; width: 92%; height: 94%; object-fit: cover; object-position: 50% 0; }
.pk-rc-badge {
  position: absolute; z-index: 3; top: 5%; right: 8%; display: flex; align-items: center; justify-content: center; width: 19%;
  height: 13.6%; border: 2px solid currentColor; border-radius: 50%; background: rgba(var(--pk-ground-rgb), 0.85); color: var(--pk-accent);
}
.pk-rc-danger .pk-rc-badge { color: var(--pk-danger); }
.pk-rc-second .pk-rc-badge { color: var(--pk-second); }
.pk-rc .pk-rc-mark { right: auto; left: 8%; color: var(--pk-mark); }
.pk-rc-badge .pk-icon { width: 60%; height: 60%; }
.pk-rc-band {
  position: absolute; z-index: 2; right: 4%; bottom: 3%; left: 4%; display: flex; flex-direction: column; align-items: center;
  padding: 30% 7% 6%; background: linear-gradient(rgba(var(--pk-ground-rgb), 0), rgba(var(--pk-ground-rgb), 0.86) 48%, rgba(var(--pk-ground-rgb), 0.97));
}
.pk-rc-name {
  width: 100%; padding-top: 5%; border-top: 1px solid rgba(var(--pk-accent-rgb), 0.6); font-family: var(--pk-font-display);
  font-stretch: var(--pk-display-stretch); font-size: 1em; font-weight: 600;
}
.pk-rc-team {
  display: block; margin-top: 3%; color: var(--pk-text-dim); font-family: var(--pk-font-digits); font-size: 0.5em; letter-spacing: 0.07em;
  text-transform: uppercase;
}
.pk-rc-danger .pk-rc-team { color: var(--pk-danger); }
.pk-rc-second .pk-rc-team { color: var(--pk-second); }
.pk-rc-back { background: repeating-linear-gradient(90deg, rgba(var(--pk-accent-rgb), 0.13) 0, rgba(var(--pk-accent-rgb), 0.13) 1px, rgba(0, 0, 0, 0) 1px, rgba(0, 0, 0, 0) 6px), var(--pk-ground); }
.pk-rc-back::after {
  content: ""; position: absolute; top: 0; right: 0; bottom: 0; left: 0;
  background: radial-gradient(circle at 50% 50%, rgba(var(--pk-ground-rgb), 0.92) 30%, rgba(var(--pk-ground-rgb), 0) 62%);
}
.pk-rc-seal {
  position: absolute; z-index: 3; top: 50%; right: 17%; left: 17%; display: flex; align-items: center; justify-content: center; height: 47.1%;
  border: 2px solid var(--pk-accent); border-radius: 50%; background: var(--pk-ground); color: var(--pk-accent);
  box-shadow: 0 0 0 0.16em var(--pk-ground), 0 0 0 0.22em rgba(var(--pk-accent-rgb), 0.55); transform: translateY(-50%);
}
.pk-rc-seal img { display: block; width: 80%; height: auto; }
.pk-rc-seal .pk-icon { width: 50%; height: 50%; }
.pk-flip { position: relative; flex: none; perspective: 1600px; }
.pk-flip-turn { position: relative; width: 100%; height: 100%; transform-style: preserve-3d; animation: pk-flip-in 0.9s cubic-bezier(0.2, 0.7, 0.2, 1) both; }
.pk-flip-side { position: absolute; top: 0; left: 0; width: 100%; height: 100%; -webkit-backface-visibility: hidden; backface-visibility: hidden; }
.pk-flip-back { transform: rotateY(180deg); }

/* Scenes (tv/scenes.tsx): the cue card, the how-to loop, the verdict, the truth */
/* As tall as its words: with the strip and the captions, the frame's middle has about 480 px for the cue and what's
   under it. */
.pk-cue { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; width: 1040px; margin: 0 auto; padding: 32px 70px; text-align: center; }
.pk-cue-title { font-family: var(--pk-font-display); font-stretch: var(--pk-display-stretch); font-size: 88px; line-height: 1.04; }
.pk-cue-sub { color: var(--pk-text-dim); font-size: 44px; }
.pk-cue-status { display: flex; align-items: center; gap: 14px; padding-top: 8px; color: var(--pk-accent); font-family: var(--pk-font-digits); font-size: 36px; }
.pk-how { position: relative; height: 92px; list-style: none; }
.pk-how-line { position: absolute; top: 0; right: 0; left: 0; display: flex; gap: 18px; font-size: 32px; line-height: 1.35; opacity: 0; transition: opacity 0.4s; }
.pk-how-now { opacity: 1; }
.pk-how-n {
  display: flex; flex: none; align-items: center; justify-content: center; width: 46px; height: 46px; border: 2px solid var(--pk-accent);
  border-radius: 50%; color: var(--pk-accent); font-size: 26px; font-weight: 700;
}
.pk-verdict-title, .pk-truth-title { font-family: var(--pk-font-display); font-stretch: var(--pk-display-stretch); font-size: 110px; line-height: 1; text-align: center; text-shadow: 0 4px 24px rgba(0, 0, 0, 0.5); }
/* The verdict sits under the top bar: its title clear of the stopwatch (the last words count down in it), the card
   ending just above the captions. */
.pk-verdict-title { position: absolute; top: 150px; right: 0; left: 0; font-size: 96px; }
.pk-verdict-who { position: absolute; top: 300px; left: 304px; display: flex; flex-direction: column; align-items: center; gap: 16px; width: 560px; }
/* Inside .pk-verdict-who: across the portrait's lower half, the name tag under it left to read (a long Greek
   "Καταδικάζεται", tilted, touched it at 76 px and 150 px down). */
.pk-verdict-stamp { position: absolute; top: 140px; right: 0; left: 0; z-index: 3; display: flex; justify-content: center; }
.pk-verdict-stamp .pk-stamp { border-width: 6px; font-size: 66px; }
.pk-verdict-note { display: flex; align-items: center; gap: 12px; color: var(--pk-text-dim); font-size: 34px; }
.pk-verdict-note .pk-icon { width: 38px; height: 38px; }
.pk-verdict-card { position: absolute; top: 266px; left: 1024px; display: flex; flex-direction: column; align-items: center; gap: 16px; width: 400px; }
/* The truth in one column, top down: the title and the banner, the cards, the awards, kept above the captions (the
   frame's last 120 px). In flow, so the awards follow the cards however many rows they take: placed apart, they had
   covered a 12-player table's second row of names. */
.pk-truth { display: flex; flex-direction: column; align-items: center; gap: 22px; padding-bottom: 124px; }
.pk-truth-head { display: flex; flex-direction: column; align-items: center; gap: 16px; text-align: center; }
.pk-banner {
  display: inline-block; padding: 8px 36px; background: var(--pk-accent); color: var(--pk-on-accent); font-family: var(--pk-font-digits);
  font-size: 40px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; transform: rotate(-1.5deg); animation: pk-banner-in 0.5s ease-out both;
}
.pk-fans { display: flex; flex-direction: column; align-items: center; gap: 24px; }
.pk-fans-two { gap: 14px; }
.pk-fan { display: flex; justify-content: center; gap: 20px; list-style: none; }
.pk-fan > li { display: flex; flex-direction: column; align-items: center; gap: 16px; }
.pk-fan .pk-tag { font-size: 34px; }
.pk-fans-two .pk-fan { gap: 16px; }
.pk-fans-two .pk-fan > li { gap: 10px; }
.pk-fans-two .pk-tag, .pk-fans-snug .pk-tag { font-size: 28px; }
/* An out player's card at the truth, with the game's outStamp: dimmed, the vote's own stamp landing on it once turned. */
.pk-truth-card { position: relative; display: block; }
.pk-truth-out .pk-rc-art { filter: grayscale(1) brightness(0.45) contrast(1.1); }
.pk-truth-out .pk-tag { color: var(--pk-text-dim); }
.pk-truth-stamp {
  position: absolute; top: 0; right: 0; bottom: 0; left: 0; z-index: 3; display: flex; align-items: center; justify-content: center;
  pointer-events: none;
}
.pk-truth-stamp .pk-stamp { border-width: 5px; font-size: 44px; }
.pk-fans-two .pk-truth-stamp .pk-stamp, .pk-fans-snug .pk-truth-stamp .pk-stamp { border-width: 4px; font-size: 32px; }
.pk-fan .pk-rc-danger { box-shadow: 0 0 0 4px var(--pk-ground), 0 0 0 7px var(--pk-danger); }
/* Each award on one line, the pills in rows (five Greek ones wrapped to three lines each in one row). */
.pk-awards { display: flex; flex-wrap: wrap; justify-content: center; gap: 14px 24px; padding: 0 40px; list-style: none; animation: pk-rise 0.6s ease-out both; }
.pk-awards li {
  display: flex; align-items: center; gap: 12px; padding: 10px 24px; border: 2px solid rgba(var(--pk-accent-rgb), 0.5); border-radius: 999px;
  background: rgba(var(--pk-panel-rgb), 0.86); font-size: 28px; white-space: nowrap;
}
.pk-awards .pk-icon { width: 36px; height: 36px; color: var(--pk-accent); }
.pk-awards b { font-weight: 700; }

/* The lobby (lobby/tv-lobby.tsx), on the whole frame: the ticket, how to play and the rules, who's waiting, the seats */
.pk-tv-lobby .pk-ticket { position: absolute; top: 0; right: 0; width: 860px; height: 380px; }
.pk-tv-lobby-url { max-width: 100%; overflow: hidden; font-size: 44px; font-weight: 600; line-height: 1.15; white-space: nowrap; }
.pk-tv-lobby-how { position: absolute; top: 402px; right: 0; display: flex; flex-direction: column; gap: 16px; width: 860px; min-height: 210px; padding: 28px 34px; }
.pk-tv-lobby-how > .pk-tape { align-self: flex-start; }
.pk-tv-lobby .pk-card-tv {
  position: absolute; top: 250px; left: 0; width: 820px; max-height: 360px; overflow: hidden; padding: 26px 32px;
  border: 1px solid rgba(var(--pk-accent-rgb), 0.3); border-radius: 22px; background: rgba(var(--pk-panel-rgb), 0.86); font-size: 28px;
}
.pk-tv-lobby .pk-card-title {
  display: inline-block; margin-bottom: 14px; padding: 4px 16px 3px; border-left: 5px solid var(--pk-accent); background: rgba(var(--pk-text-rgb), 0.1);
  font-family: var(--pk-font-digits); font-size: 30px; font-weight: 400; letter-spacing: 0.05em; text-transform: uppercase;
}
/* The Host Pass's thank-you: one line (two in Greek) between the logo and the rules card, clear of the join ticket. */
.pk-tv-pass { position: absolute; top: 164px; left: 0; display: flex; align-items: center; gap: 14px; max-width: 820px; color: var(--pk-accent); font-size: 30px; line-height: 1.2; }
.pk-tv-waiting { position: absolute; top: 636px; right: 0; left: 0; display: flex; align-items: center; justify-content: center; gap: 16px; color: var(--pk-text-dim); font-size: 36px; }
.pk-seats { position: absolute; top: 728px; right: 0; left: 0; display: flex; flex-wrap: wrap; justify-content: center; gap: 12px 24px; margin: 0 auto; list-style: none; }
/* Two classes: the kit's reset (.pk-root ul) would win the margin over one. */
.pk-tv-lobby .pk-seats { margin: 0 auto; }
.pk-seat { position: relative; display: flex; flex-direction: column; align-items: center; gap: 12px; width: 184px; text-align: center; animation: pk-seat-pop 0.6s cubic-bezier(0.2, 0.8, 0.2, 1.2) both; }
/* READY on the medallion's top right corner, clear of the face and the name tag. */
.pk-seat-ready { position: absolute; z-index: 2; top: -10px; right: -6px; border-width: 3px; font-size: 28px; }
.pk-seat-offline .pk-med { border-style: dashed; opacity: 0.6; }
.pk-seats-m { gap: 12px; }
.pk-seats-m .pk-seat { width: 128px; gap: 10px; }
.pk-seats-m .pk-tag { font-size: 32px; }
.pk-seats-m .pk-tag-blank { font-size: 26px; }
.pk-seats-m .pk-seat-ready { top: -10px; font-size: 24px; }
.pk-seats-s { top: 690px; gap: 8px 12px; }
.pk-tv-lobby-crowd .pk-tv-waiting { top: 612px; }
.pk-seats-s .pk-seat { width: 120px; gap: 8px; }
.pk-seats-s .pk-tag { font-size: 28px; }
.pk-seats-s .pk-tag-blank { font-size: 22px; }
.pk-seats-s .pk-seat-ready { top: -10px; right: -8px; font-size: 20px; }

@keyframes pk-drift { from { transform: scale(1.02); } to { transform: scale(1.08) translate(-1.5%, -1%); } }
@keyframes pk-breathe { 50% { opacity: 0.35; transform: scale(0.8); } }
@keyframes pk-tick { 0%, 100% { transform: rotate(-8deg); } 12% { transform: rotate(-8deg) scale(1.05); } }
@keyframes pk-stamp-in {
  0% { opacity: 0; transform: rotate(-12deg) scale(2.2); }
  60% { opacity: 1; transform: rotate(-12deg) scale(0.96); }
  75% { transform: rotate(-12deg) translateX(3px); }
  88% { transform: rotate(-12deg) translateX(-3px); }
  100% { opacity: 1; transform: rotate(-12deg); }
}
@keyframes pk-seal-in { 0% { opacity: 0; transform: rotate(-12deg) scale(2); } 60% { opacity: 1; transform: rotate(-12deg) scale(0.95); } 100% { opacity: 1; transform: rotate(-12deg); } }
@keyframes pk-flip-in { from { transform: rotateY(180deg); } to { transform: rotateY(0deg); } }
@keyframes pk-banner-in { from { opacity: 0; transform: rotate(-1.5deg) scale(1.3); } to { opacity: 1; transform: rotate(-1.5deg); } }
@keyframes pk-rise { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: none; } }
@keyframes pk-seat-pop { 0% { opacity: 0; transform: translateY(40px) scale(0.7); } 60% { opacity: 1; transform: translateY(-8px) scale(1.05); } 100% { opacity: 1; transform: none; } }

/* The TV's first-time card (tv/teach-card.tsx): over the scene, under the top bar and the captions, a bar running out
   its time. No inset shorthand: 2022 TVs run Chromium 85. */
.pk-teach {
  position: absolute; top: 0; right: 0; bottom: 0; left: 0; z-index: 2; display: flex; align-items: center; justify-content: center;
  background: rgba(var(--pk-ground-rgb), 0.6); animation: pk-teach-in 0.4s ease-out both;
}
.pk-teach-card { display: flex; flex-direction: column; gap: 22px; width: 1160px; max-width: 100%; padding: 48px 64px 60px; background: rgba(var(--pk-panel-rgb), 0.97); }
.pk-teach-title { font-family: var(--pk-font-display); font-stretch: var(--pk-display-stretch); font-size: 64px; line-height: 1.1; }
.pk-teach-lines { display: flex; flex-direction: column; gap: 14px; list-style: none; font-size: 38px; line-height: 1.3; }
.pk-teach-lines li { padding-left: 26px; border-left: 4px solid var(--pk-accent); }
.pk-teach-bar {
  position: absolute; bottom: 0; left: 0; width: 100%; height: 6px; background: var(--pk-accent); transform-origin: left center;
  animation: pk-teach-run var(--pk-teach-ms, 6s) linear both;
}
@keyframes pk-teach-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes pk-teach-run { from { transform: scaleX(1); } to { transform: scaleX(0); } }

/* Calmer motion: the system's setting or the phone's own */
@media (prefers-reduced-motion: reduce) {
  .pk-root *, .pk-root *::before, .pk-root *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
}
.pk-calm *, .pk-calm *::before, .pk-calm *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }

/* The simple stage: a TV that can't keep up (tv/simple-stage.ts). The art holds still, a card's turn becomes a crossfade
   from its back, and draw-ins that fly, pop or spin become plain fades, at their own times. Crossfades stay. */
.pk-stage-simple .pk-tv-art { animation: none; transform: scale(1.02); will-change: auto; }
.pk-stage-simple .pk-flip-turn { animation-name: none; transform: none; transform-style: flat; }
.pk-stage-simple .pk-flip-back { transform: none; animation: pk-fade-out 0.5s ease-out both; animation-delay: inherit; }
.pk-stage-simple .pk-stamp, .pk-stage-simple .pk-seal, .pk-stage-simple .pk-banner, .pk-stage-simple .pk-awards, .pk-stage-simple .pk-seat { animation-name: pk-fade; }
.pk-stage-simple .pk-live-dot { animation: none; }
@keyframes pk-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes pk-fade-out { from { opacity: 1; } to { opacity: 0; } }
`;function oo(t=typeof document>"u"?void 0:document){if(!t||t.getElementById("pk-styles"))return;const e=t.createElement("style");e.id="pk-styles",e.textContent=io,t.head.appendChild(e)}function ro(){let t=null;try{t=typeof location>"u"?null:new URLSearchParams(location.search).get("stage")}catch{t=null}return t==="simple"?{simple:!0,measure:!1,source:"forced"}:t==="full"?(Ti(Ce.tvStage),{simple:!1,measure:!1,source:"forced"}):ae(Ce.tvStage)==="simple"?{simple:!0,measure:!1,source:"stored"}:{simple:!1,measure:!0,source:"measured"}}const Pe=ro(),no=E(Pe.simple);Pe.measure||Pe.simple;function Gt(t){Ei(),oo(),eo();const e=t.lang??J.value;to(e);const i=["pk-root",`pk-${t.surface}`];return Ni.value&&i.push("pk-calm"),t.surface==="tv"&&no.value&&i.push("pk-stage-simple"),t.class&&i.push(t.class),u(Bt.Provider,{value:e,children:u("div",{class:i.join(" "),"data-theme":t.theme??"palermo",lang:e,style:t.surface==="phone"?`--pk-scale:${It.value}`:void 0,children:t.children})})}const ao="party-legal",so={rights:"kit.legal.rights",gemi:"kit.legal.gemi",vat:"kit.legal.vat",company:"kit.legal.company",privacy:"kit.legal.privacy",terms:"kit.legal.terms"};function qt(){const t=Wt(),e=Fe();return Ct(()=>{for(const i of document.querySelectorAll(`#${ao} [data-legal]`)){const o=so[i.dataset.legal??""];o!==void 0&&(i.textContent=t(o))}},[e]),null}const po=1920,lo=1080;function Xt(t,e){const i=Math.min(t/po,e/lo);return i>0&&Number.isFinite(i)?i:1}function gt(){return typeof window>"u"?1:Xt(window.innerWidth,window.innerHeight)}function co(t){const[e,i]=li(gt),o=di(null);return Ct(()=>{const n=()=>{const a=o.current;i(a&&a.clientWidth>0&&a.clientHeight>0?Xt(a.clientWidth,a.clientHeight):gt())};n(),window.addEventListener("resize",n);const r=typeof ResizeObserver>"u"||!o.current?null:new ResizeObserver(n);return r&&o.current&&r.observe(o.current),()=>{window.removeEventListener("resize",n),r==null||r.disconnect()}},[]),u("div",{ref:o,class:"pk-tv-viewport",children:u("div",{class:"pk-tv-stage",style:`transform:translate(-50%,-50%) scale(${e})`,children:t.children})})}const ko={"door.title.tv":"Το παιχνίδι σε αυτή την οθόνη","door.going":"Άνοιγμα του παιχνιδιού…","door.soon":"Αυτό το παιχνίδι δεν έχει ανοίξει ακόμα. Έλεγξε τον κωδικό.","door.language":"Γλώσσα","door.tv.help":"Γράψε τα δώδεκα ψηφία του κωδικού τηλεόρασης με τα πλήκτρα του τηλεχειριστηρίου και πάτησε OK.","door.tv.where":"Ο κωδικός τηλεόρασης είναι στο κινητό του οικοδεσπότη, στο «Στην τηλεόραση»."},ho={"door.title.tv":"Show the game on this screen","door.going":"Opening the game…","door.soon":"This game isn't open yet. Check the code.","door.language":"Language","door.tv.help":"Type the TV code's twelve digits with your remote's number keys, then press OK.","door.tv.where":"The TV code is on the host's phone, under “Show on TV”."};function vo(){Bi({el:ko,en:ho})}function bo(t){return u(Gt,{surface:"phone",theme:"vgraphics",children:[u(qt,{}),u("div",{class:"door door-phone",children:[u("div",{class:"door-art","aria-hidden":"true"}),u("header",{class:"door-top",children:[u(Kt,{class:"door-logo"}),u(uo,{})]}),u("main",{class:"door-band",children:t.children})]})]})}function xo(t){return u(Gt,{surface:"tv",theme:"vgraphics",lang:J.value,children:[u(qt,{}),u(co,{children:u("div",{class:"door door-tv",children:[u("div",{class:"door-art","aria-hidden":"true"}),u("header",{class:"door-top",children:u(Kt,{class:"door-logo"})}),u("main",{class:"door-band",children:t.children})]})})]})}function uo(){const t=Wt(),e=Fe()==="el"?"en":"el";return u("button",{type:"button",class:"pk-link door-lang","aria-label":t("door.language"),lang:e,onClick:()=>Xi(e),children:Ki[e]})}function Kt(t){return u("svg",{class:t.class,viewBox:"0 0 555 589",role:"img","aria-label":"VGraphics",children:[u("g",{fill:"currentColor",children:[u("path",{d:"M0.5 113.5H285.5V169.5H56.5V285.5H143L199 341.5H0.5Z"}),u("path",{d:"M133 244.5H217L445.5 473H361.5Z"}),u("path",{d:"M389.5 244.5H446.5V444.5L389.5 387.5Z"})]}),u("circle",{cx:"400.5",cy:"127.5",r:"59.5",fill:"#588FFA"}),u("circle",{cx:"513",cy:"152",r:"41",fill:"#4B4FD9"}),u("circle",{cx:"518",cy:"62",r:"29",fill:"#D2676C"}),u("circle",{cx:"447.5",cy:"27",r:"26.5",fill:"#E5B833"}),u("g",{fill:"currentColor",transform:"translate(39.02 586.76) scale(0.0754 -0.0754)",children:[u("path",{d:"M212 0L4 660L180 660L316 134L319 134L452 660L628 660L420 0Z"}),u("path",{transform:"translate(735 0)",d:"M301 -14Q215 -14 154 29Q92 72 60 149Q27 225 27 325Q27 399 46 463Q64 526 103 574Q142 621 202 648Q262 674 345 674Q415 674 466 655Q516 636 548 602Q580 568 593 524Q606 479 601 428L450 410Q452 455 439 484Q426 512 401 526Q375 540 339 540Q296 540 264 517Q232 494 215 448Q197 402 197 333Q197 282 207 242Q217 201 237 174Q257 146 287 132Q316 117 354 117Q392 117 419 131Q446 144 461 168Q475 191 475 222L371 222L371 336L619 336L619 212L619 0L508 0L508 178L499 178Q494 116 470 73Q445 30 403 8Q360 -14 301 -14Z"}),u("path",{transform:"translate(1524 0)",d:"M40 0L40 660L314 660Q358 660 398 653Q437 645 470 630Q502 615 526 592Q550 569 563 538Q576 506 576 466Q576 435 566 408Q555 380 533 358Q510 336 475 322Q439 307 390 301L390 293Q454 290 489 268Q524 246 542 213Q559 179 568 140L603 0L424 0L399 131Q393 165 381 186Q368 207 345 217Q322 227 284 227L202 227L202 0ZM202 352L296 352Q351 352 380 373Q409 394 409 437Q409 484 382 507Q355 530 300 530L202 530Z"}),u("path",{transform:"translate(2285 0)",d:"M4 0L225 660L435 660L655 0L480 0L332 529L326 529L177 0ZM129 117L129 231L550 231L550 117Z"}),u("path",{transform:"translate(3084 0)",d:"M161 187L161 317L284 317Q345 317 375 342Q405 366 405 423Q405 477 378 504Q350 530 294 530L161 530L161 660L303 660Q360 660 409 647Q458 633 495 604Q531 575 552 531Q572 487 572 425Q572 346 537 293Q501 240 434 214Q367 187 270 187ZM40 0L40 660L202 660L202 0Z"}),u("path",{transform:"translate(3810 0)",d:"M435 0L435 660L597 660L597 0ZM40 0L40 660L202 660L202 0ZM161 264L161 400L520 400L520 264Z"}),u("path",{transform:"translate(4587 0)",d:"M40 0L40 660L203 660L203 0Z"}),u("path",{transform:"translate(4970 0)",d:"M341 -14Q257 -14 197 13Q137 40 99 88Q61 136 44 198Q26 259 26 328Q26 399 44 462Q62 525 100 573Q137 620 196 647Q255 674 338 674Q410 674 462 654Q514 633 546 598Q577 562 589 516Q601 470 595 420L446 402Q448 445 436 476Q423 507 398 524Q372 541 333 541Q300 541 275 528Q249 515 232 489Q214 463 205 425Q196 386 196 335Q196 269 212 221Q228 172 261 146Q294 119 344 119Q390 119 417 140Q443 161 454 198Q465 235 461 281L614 268Q619 213 607 163Q594 112 562 72Q529 32 475 9Q420 -14 341 -14Z"}),u("path",{transform:"translate(5747 0)",d:"M299 -14Q229 -14 177 2Q124 18 89 48Q54 78 38 121Q21 163 23 215L173 248Q175 202 193 174Q210 145 240 132Q270 118 307 118Q337 118 360 126Q383 133 397 147Q410 160 410 178Q410 202 392 218Q374 233 343 244Q311 255 271 266Q228 278 186 293Q143 307 108 329Q73 351 52 386Q30 421 30 473Q30 537 63 582Q95 627 153 651Q210 674 284 674Q362 674 423 648Q484 621 517 570Q550 519 543 445L395 421Q396 451 389 474Q382 497 368 513Q353 529 331 538Q309 546 279 546Q248 546 228 538Q207 530 197 516Q186 502 186 484Q186 463 202 449Q218 435 248 425Q278 414 319 403Q362 391 406 377Q449 362 486 339Q523 315 546 278Q568 241 568 184Q568 118 534 74Q499 30 439 8Q378 -14 299 -14Z"})]})]})}export{di as A,bo as P,fo as R,mo as S,xo as T,Wt as a,K as b,li as d,Ct as h,vo as l,J as p,Wi as t,u};
