var gi=Object.defineProperty;var mi=(t,e,i)=>e in t?gi(t,e,{enumerable:!0,configurable:!0,writable:!0,value:i}):t[e]=i;var ae=(t,e,i)=>mi(t,typeof e!="symbol"?e+"":e,i);var Te,f,$t,Qt,F,ot,Pt,Vt,Ce,le,X,Ot,Ye,Pe,Ve,Nt,ue={},ge=[],fi=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i,Se=Array.isArray;function P(t,e){for(var i in e)t[i]=e[i];return t}function Be(t){t&&t.parentNode&&t.parentNode.removeChild(t)}function vi(t,e,i){var o,n,r,a={};for(r in e)r=="key"?o=e[r]:r=="ref"?n=e[r]:a[r]=e[r];if(arguments.length>2&&(a.children=arguments.length>3?Te.call(arguments,2):i),typeof t=="function"&&t.defaultProps!=null)for(r in t.defaultProps)a[r]===void 0&&(a[r]=t.defaultProps[r]);return de(t,a,o,n,null)}function de(t,e,i,o,n){var r={type:t,props:e,key:i,ref:o,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:n??++$t,__i:-1,__u:0};return n==null&&f.vnode!=null&&f.vnode(r),r}function oe(t){return t.children}function Z(t,e){this.props=t,this.context=e}function D(t,e){if(e==null)return t.__?D(t.__,t.__i+1):null;for(var i;e<t.__k.length;e++)if((i=t.__k[e])!=null&&i.__e!=null)return i.__e;return typeof t.type=="function"?D(t):null}function bi(t){if(t.__P&&t.__d){var e=t.__v,i=e.__e,o=[],n=[],r=P({},e);r.__v=e.__v+1,f.vnode&&f.vnode(r),Ue(t.__P,r,e,t.__n,t.__P.namespaceURI,32&e.__u?[i]:null,o,i??D(e),!!(32&e.__u),n),r.__v=e.__v,r.__.__k[r.__i]=r,It(o,r,n),e.__e=e.__=null,r.__e!=i&&Et(r)}}function Et(t){if((t=t.__)!=null&&t.__c!=null)return t.__e=t.__c.base=null,t.__k.some(function(e){if(e!=null&&e.__e!=null)return t.__e=t.__c.base=e.__e}),Et(t)}function Oe(t){(!t.__d&&(t.__d=!0)&&F.push(t)&&!me.__r++||ot!=f.debounceRendering)&&((ot=f.debounceRendering)||Pt)(me)}function me(){try{for(var t,e=1;F.length;)F.length>e&&F.sort(Vt),t=F.shift(),e=F.length,bi(t)}finally{F.length=me.__r=0}}function Ft(t,e,i,o,n,r,a,l,c,p,d){var u,s,k,v,T,b,x=o&&o.__k||ge,m=e.length;for(c=xi(i,e,x,c,m),u=0;u<m;u++)(k=i.__k[u])!=null&&(s=k.__i!=-1&&x[k.__i]||ue,k.__i=u,b=Ue(t,k,s,n,r,a,l,c,p,d),v=k.__e,k.ref&&s.ref!=k.ref&&(s.ref&&qe(s.ref,null,k),d.push(k.ref,k.__c||v,k)),T==null&&v!=null&&(T=v),4&k.__u?(c=Rt(k,c,t),s.__e&&(s.__e=null)):typeof k.type=="function"&&b!==void 0?c=b:v&&(c=v.nextSibling),k.__u&=-7);return i.__e=T,c}function xi(t,e,i,o,n){var r,a,l,c,p,d=i.length,u=d,s=0;for(t.__k=new Array(n),r=0;r<n;r++)(a=e[r])!=null&&typeof a!="boolean"&&typeof a!="function"?(typeof a=="string"||typeof a=="number"||typeof a=="bigint"||a.constructor==String?a=t.__k[r]=de(null,a,null,null,null):Se(a)?a=t.__k[r]=de(oe,{children:a},null,null,null):a.constructor===void 0&&a.__b>0?a=t.__k[r]=de(a.type,a.props,a.key,a.ref?a.ref:null,a.__v):t.__k[r]=a,c=r+s,a.__=t,a.__b=t.__b+1,l=null,(p=a.__i=wi(a,i,c,u))!=-1&&(u--,(l=i[p])&&(l.__u|=2)),l==null||l.__v==null?(p==-1&&(n>d?s--:n<d&&s++),typeof a.type!="function"&&(a.__u|=4)):p!=c&&(p==c-1?s--:p==c+1?s++:(p>c?s--:s++,a.__u|=4))):t.__k[r]=null;if(u)for(r=0;r<d;r++)(l=i[r])!=null&&(2&l.__u)==0&&(l.__e==o&&(o=D(l)),Wt(l,l));return o}function Rt(t,e,i){var o,n;if(typeof t.type=="function"){for(o=t.__k,n=0;o&&n<o.length;n++)o[n]&&(o[n].__=t,e=Rt(o[n],e,i));return e}t.__e!=e&&(e&&t.type&&!e.parentNode&&(e=D(t)),e=i.insertBefore(t.__e,e||null));do e=e&&e.nextSibling;while(e!=null&&e.nodeType==8);return e}function wi(t,e,i,o){var n,r,a,l=t.key,c=t.type,p=e[i],d=p!=null&&(2&p.__u)==0;if(p===null&&l==null||d&&l==p.key&&c==p.type)return i;if(o>(d?1:0)){for(n=i-1,r=i+1;n>=0||r<e.length;)if((p=e[a=n>=0?n--:r++])!=null&&(2&p.__u)==0&&l==p.key&&c==p.type)return a}return-1}function nt(t,e,i){e[0]=="-"?t.setProperty(e,i??""):t[e]=i==null?"":typeof i!="number"||fi.test(e)?i:i+"px"}function se(t,e,i,o,n){var r,a;e:if(e=="style")if(typeof i=="string")t.style.cssText=i;else{if(typeof o=="string"&&(t.style.cssText=o=""),o)for(e in o)i&&e in i||nt(t.style,e,"");if(i)for(e in i)o&&i[e]==o[e]||nt(t.style,e,i[e])}else if(e[0]=="o"&&e[1]=="n")r=e!=(e=e.replace(Ot,"$1")),a=e.toLowerCase(),e=a in t||e=="onFocusOut"||e=="onFocusIn"?a.slice(2):e.slice(2),t.l||(t.l={}),t.l[e+r]=i,i?o?i[X]=o[X]:(i[X]=Ye,t.addEventListener(e,r?Ve:Pe,r)):t.removeEventListener(e,r?Ve:Pe,r);else{if(n=="http://www.w3.org/2000/svg")e=e.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if(e!="width"&&e!="height"&&e!="href"&&e!="list"&&e!="form"&&e!="tabIndex"&&e!="download"&&e!="rowSpan"&&e!="colSpan"&&e!="role"&&e!="popover"&&e in t)try{t[e]=i??"";break e}catch{}typeof i=="function"||(i==null||i===!1&&e[4]!="-"?t.removeAttribute(e):t.setAttribute(e,e=="popover"&&i==1?"":i))}}function rt(t){return function(e){if(this.l){var i=this.l[e.type+t];if(e[le]==null)e[le]=Ye++;else if(e[le]<i[X])return;return i(f.event?f.event(e):e)}}}function Ue(t,e,i,o,n,r,a,l,c,p){var d,u,s,k,v,T,b,x,m,S,N,L,H,K,g,E,j=e.type;if(e.constructor!==void 0)return null;128&i.__u&&(c=!!(32&i.__u),r=[l=e.__e=i.__e]),(d=f.__b)&&d(e);e:if(typeof j=="function"){u=a.length;try{if(m=e.props,S=j.prototype&&j.prototype.render,N=(d=j.contextType)&&o[d.__c],L=d?N?N.props.value:d.__:o,i.__c?x=(s=e.__c=i.__c).__=s.__E:(S?e.__c=s=new j(m,L):(e.__c=s=new Z(m,L),s.constructor=j,s.render=_i),N&&N.sub(s),s.state||(s.state={}),s.__n=o,k=s.__d=!0,s.__h=[],s._sb=[]),S&&s.__s==null&&(s.__s=s.state),S&&j.getDerivedStateFromProps!=null&&(s.__s==s.state&&(s.__s=P({},s.__s)),P(s.__s,j.getDerivedStateFromProps(m,s.__s))),v=s.props,T=s.state,s.__v=e,k)S&&j.getDerivedStateFromProps==null&&s.componentWillMount!=null&&s.componentWillMount(),S&&s.componentDidMount!=null&&s.__h.push(s.componentDidMount);else{if(S&&j.getDerivedStateFromProps==null&&m!==v&&s.componentWillReceiveProps!=null&&s.componentWillReceiveProps(m,L),e.__v==i.__v||!s.__e&&s.shouldComponentUpdate!=null&&s.shouldComponentUpdate(m,s.__s,L)===!1){e.__v!=i.__v&&(s.props=m,s.state=s.__s,s.__d=!1),e.__e=i.__e,e.__k=i.__k,e.__k.some(function(W){W&&(W.__=e)}),ge.push.apply(s.__h,s._sb),s._sb=[],s.__h.length&&a.push(s),l=D(i);break e}s.componentWillUpdate!=null&&s.componentWillUpdate(m,s.__s,L),S&&s.componentDidUpdate!=null&&s.__h.push(function(){s.componentDidUpdate(v,T,b)})}if(s.context=L,s.props=m,s.__P=t,s.__e=!1,H=f.__r,K=0,S)s.state=s.__s,s.__d=!1,H&&H(e),d=s.render(s.props,s.state,s.context),ge.push.apply(s.__h,s._sb),s._sb=[];else do s.__d=!1,H&&H(e),d=s.render(s.props,s.state,s.context),s.state=s.__s;while(s.__d&&++K<25);s.state=s.__s,s.getChildContext!=null&&(o=P(P({},o),s.getChildContext())),S&&!k&&s.getSnapshotBeforeUpdate!=null&&(b=s.getSnapshotBeforeUpdate(v,T)),g=d!=null&&d.type===oe&&d.key==null?Gt(d.props.children):d,l=Ft(t,Se(g)?g:[g],e,i,o,n,r,a,l,c,p),s.base=e.__e,e.__u&=-161,s.__h.length&&a.push(s),x&&(s.__E=s.__=null)}catch(W){if(a.length=u,e.__v=null,c||r!=null){if(W.then){for(e.__u|=c?160:128;l&&l.nodeType==8&&l.nextSibling;)l=l.nextSibling;r!=null&&(r[r.indexOf(l)]=null),e.__e=l}else if(r!=null)for(E=r.length;E--;)Be(r[E])}else e.__e=i.__e;e.__k==null&&(e.__k=i.__k||[]),W.then||Dt(e),f.__e(W,e,i)}}else r==null&&e.__v==i.__v?(e.__k=i.__k,e.__e=i.__e):l=e.__e=yi(i.__e,e,i,o,n,r,a,c,p);return(d=f.diffed)&&d(e),128&e.__u?void 0:l}function Dt(t){t&&(t.__c&&(t.__c.__e=!0),t.__k&&t.__k.some(Dt))}function It(t,e,i){for(var o=0;o<i.length;o++)qe(i[o],i[++o],i[++o]);f.__c&&f.__c(e,t),t.some(function(n){try{t=n.__h,n.__h=[],t.some(function(r){r.call(n)})}catch(r){f.__e(r,n.__v)}})}function Gt(t){return typeof t!="object"||t==null||t.__b>0?t:Se(t)?t.map(Gt):t.constructor!==void 0?null:P({},t)}function yi(t,e,i,o,n,r,a,l,c){var p,d,u,s,k,v,T,b=i.props||ue,x=e.props,m=e.type;if(m=="svg"?n="http://www.w3.org/2000/svg":m=="math"?n="http://www.w3.org/1998/Math/MathML":n||(n="http://www.w3.org/1999/xhtml"),r!=null){for(p=0;p<r.length;p++)if((k=r[p])&&"setAttribute"in k==!!m&&(m?k.localName==m:k.nodeType==3)){t=k,r[p]=null;break}}if(t==null){if(m==null)return document.createTextNode(x);t=document.createElementNS(n,m,x.is&&x),l&&(f.__m&&f.__m(e,r),l=!1),r=null}if(m==null)b===x||l&&t.data==x||(t.data=x);else{if(r=m=="textarea"&&x.defaultValue!=null?null:r&&Te.call(t.childNodes),!l&&r!=null)for(b={},p=0;p<t.attributes.length;p++)b[(k=t.attributes[p]).name]=k.value;for(p in b)k=b[p],p=="dangerouslySetInnerHTML"?u=k:p=="children"||p in x||p=="value"&&"defaultValue"in x||p=="checked"&&"defaultChecked"in x||se(t,p,null,k,n);for(p in x)k=x[p],p=="children"?s=k:p=="dangerouslySetInnerHTML"?d=k:p=="value"?v=k:p=="checked"?T=k:l&&typeof k!="function"||b[p]===k||se(t,p,k,b[p],n);if(d)l||u&&(d.__html==u.__html||d.__html==t.innerHTML)||(t.innerHTML=d.__html),e.__k=[];else if(u&&(t.innerHTML=""),Ft(e.type=="template"?t.content:t,Se(s)?s:[s],e,i,o,m=="foreignObject"?"http://www.w3.org/1999/xhtml":n,r,a,r?r[0]:i.__k&&D(i,0),l,c),r!=null)for(p=r.length;p--;)Be(r[p]);l&&m!="textarea"||(p="value",m=="progress"&&v==null?t.removeAttribute("value"):v!=null&&(v!==t[p]||m=="progress"&&!v||m=="option"&&v!=b[p])&&se(t,p,v,b[p],n),p="checked",T!=null&&T!=t[p]&&se(t,p,T,b[p],n))}return t}function qe(t,e,i){try{if(typeof t=="function"){var o=typeof t.__u=="function";o&&t.__u(),o&&e==null||(t.__u=t(e))}else t.current=e}catch(n){f.__e(n,i)}}function Wt(t,e,i){var o,n;if(f.unmount&&f.unmount(t),(o=t.ref)&&(o.current&&o.current!=t.__e||qe(o,null,e)),(o=t.__c)!=null){if(o.componentWillUnmount)try{o.componentWillUnmount()}catch(r){f.__e(r,e)}o.base=o.__P=o.__n=null}if(o=t.__k)for(n=0;n<o.length;n++)o[n]&&Wt(o[n],e,i||typeof t.type!="function");i||Be(t.__e),t.__c=t.__=t.__e=void 0}function _i(t,e,i){return this.constructor(t,i)}function Ro(t,e,i){var o,n,r,a;e==document&&(e=document.documentElement),f.__&&f.__(t,e),n=(o=!1)?null:e.__k,r=[],a=[],Ue(e,t=e.__k=vi(oe,null,[t]),n||ue,ue,e.namespaceURI,n?null:e.firstChild?Te.call(e.childNodes):null,r,n?n.__e:e.firstChild,o,a),It(r,t,a),t.props.children=null}function Ti(t){function e(i){var o,n;return this.getChildContext||(o=new Set,(n={})[e.__c]=this,this.getChildContext=function(){return n},this.componentWillUnmount=function(){o=null},this.shouldComponentUpdate=function(r){this.props.value!=r.value&&o.forEach(function(a){a.__e=!0,Oe(a)})},this.sub=function(r){o.add(r);var a=r.componentWillUnmount;r.componentWillUnmount=function(){o&&o.delete(r),a&&a.call(r)}}),i.children}return e.__c="__cC"+Nt++,e.__=t,e.Provider=e.__l=(e.Consumer=function(i,o){return i.children(o)}).contextType=e,e}Te=ge.slice,f={__e:function(t,e,i,o){for(var n,r,a;e=e.__;)if((n=e.__c)&&!n.__)try{if((r=n.constructor)&&r.getDerivedStateFromError!=null&&(n.setState(r.getDerivedStateFromError(t)),a=n.__d),n.componentDidCatch!=null&&(n.componentDidCatch(t,o||{}),a=n.__d),a)return n.__E=n}catch(l){t=l}throw t}},$t=0,Qt=function(t){return t!=null&&t.constructor===void 0},Z.prototype.setState=function(t,e){var i;i=this.__s!=null&&this.__s!=this.state?this.__s:this.__s=P({},this.state),typeof t=="function"&&(t=t(P({},i),this.props)),t&&P(i,t),t!=null&&this.__v&&(e&&this._sb.push(e),Oe(this))},Z.prototype.forceUpdate=function(t){this.__v&&(this.__e=!0,t&&this.__h.push(t),Oe(this))},Z.prototype.render=oe,F=[],Pt=typeof Promise=="function"?Promise.prototype.then.bind(Promise.resolve()):setTimeout,Vt=function(t,e){return t.__v.__b-e.__v.__b},me.__r=0,Ce=Math.random().toString(8),le="__d"+Ce,X="__a"+Ce,Ot=/(PointerCapture)$|Capture$/i,Ye=0,Pe=rt(!1),Ve=rt(!0),Nt=0;var Si=0;function h(t,e,i,o,n,r){e||(e={});var a,l,c=e;if("ref"in c)for(l in c={},e)l=="ref"?a=e[l]:c[l]=e[l];var p={type:t,props:c,key:i,ref:a,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:--Si,__i:-1,__u:0,__source:n,__self:r};if(typeof t=="function"&&(a=t.defaultProps))for(l in a)c[l]===void 0&&(c[l]=a[l]);return f.vnode&&f.vnode(p),p}var I,y,He,at,fe=0,Yt=[],_=f,st=_.__b,pt=_.__r,lt=_.diffed,dt=_.__c,ct=_.unmount,kt=_.__;function ne(t,e){_.__h&&_.__h(y,t,fe||e),fe=0;var i=y.__H||(y.__H={__:[],__h:[]});return t>=i.__.length&&i.__.push({}),i.__[t]}function ve(t){return fe=1,zi(Bt,t)}function zi(t,e,i){var o=ne(I++,2);if(o.t=t,!o.__c&&(o.__=[Bt(void 0,e),function(l){var c=o.__N?o.__N[0]:o.__[0],p=o.t(c,l);c!==p&&(o.__N=[p,o.__[1]],o.__c.setState({}))}],o.__c=y,!y.__f)){var n=function(l,c,p){if(!o.__c.__H)return!0;var d=!1,u=o.__c.props!==l;if(o.__c.__H.__.some(function(k){if(k.__N){d=!0;var v=k.__[0];k.__=k.__N,k.__N=void 0,v!==k.__[0]&&(u=!0)}}),r){var s=r.call(this,l,c,p);return d?s||u:s}return!d||u};y.__f=!0;var r=y.shouldComponentUpdate,a=y.componentWillUpdate;y.componentWillUpdate=function(l,c,p){if(this.__e){var d=r;r=void 0,n(l,c,p),r=d}a&&a.call(this,l,c,p)},y.shouldComponentUpdate=n}return o.__N||o.__}function ze(t,e){var i=ne(I++,3);!_.__s&&Xe(i.__H,e)&&(i.__=t,i.u=e,y.__H.__h.push(i))}function be(t,e){var i=ne(I++,4);!_.__s&&Xe(i.__H,e)&&(i.__=t,i.u=e,y.__h.push(i))}function Me(t){return fe=5,Ke(function(){return{current:t}},[])}function Ke(t,e){var i=ne(I++,7);return Xe(i.__H,e)&&(i.__=t(),i.__H=e,i.__h=t),i.__}function Mi(t){var e=y.context[t.__c],i=ne(I++,9);return i.c=t,e?(i.__==null&&(i.__=!0,e.sub(y)),e.props.value):t.__}function ji(){for(var t;t=Yt.shift();){var e=t.__H;if(t.__P&&e)try{e.__h.some(ce),e.__h.some(Ne),e.__h=[]}catch(i){e.__h=[],_.__e(i,t.__v)}}}_.__b=function(t){y=null,st&&st(t)},_.__=function(t,e){t&&e.__k&&e.__k.__m&&(t.__m=e.__k.__m),kt&&kt(t,e)},_.__r=function(t){pt&&pt(t),I=0;var e=(y=t.__c).__H;e&&(He===y?(e.__h=[],y.__h=[],e.__.some(function(i){i.__N&&(i.__=i.__N),i.u=i.__N=void 0})):(e.__h.some(ce),e.__h.some(Ne),e.__h=[],I=0)),He=y},_.diffed=function(t){lt&&lt(t);var e=t.__c;e&&e.__H&&(e.__H.__h.length&&(Yt.push(e)!==1&&at===_.requestAnimationFrame||((at=_.requestAnimationFrame)||Li)(ji)),e.__H.__.some(function(i){i.u&&(i.__H=i.u,i.u=void 0)})),He=y=null},_.__c=function(t,e){e.some(function(i){try{i.__h.some(ce),i.__h=i.__h.filter(function(o){return!o.__||Ne(o)})}catch(o){e.some(function(n){n.__h&&(n.__h=[])}),e=[],_.__e(o,i.__v)}}),dt&&dt(t,e)},_.unmount=function(t){ct&&ct(t);var e,i=t.__c;i&&i.__H&&(i.__H.__.some(function(o){try{ce(o)}catch(n){e=n}}),i.__H=void 0,e&&_.__e(e,i.__v))};var ht=typeof requestAnimationFrame=="function";function Li(t){var e,i=function(){clearTimeout(o),ht&&cancelAnimationFrame(e),setTimeout(t)},o=setTimeout(i,35);ht&&(e=requestAnimationFrame(i))}function ce(t){var e=y,i=t.__c;typeof i=="function"&&(t.__c=void 0,i()),y=e}function Ne(t){var e=y;t.__c=t.__(),y=e}function Xe(t,e){return!t||t.length!==e.length||e.some(function(i,o){return i!==t[o]})}function Bt(t,e){return typeof e=="function"?e(t):e}var Ci=Symbol.for("preact-signals");function je(){if(V>1)V--;else{var t,e=!1;for((function(){var n=we;for(we=void 0;n!==void 0;){var r=n.S;if(r.v===n.v)for(var a=r.t;a!==void 0;a=a.x)a.i===n.i&&(a.i=r.i);n=n.o}})();ee!==void 0;){var i=ee;for(ee=void 0,xe++;i!==void 0;){var o=i.u;if(i.u=void 0,i.f&=-3,!(8&i.f)&&qt(i))try{i.c()}catch(n){e||(t=n,e=!0)}i=o}}if(xe=0,V--,e)throw t}}function Hi(t){if(V>0)return t();Ee=++Ai,V++;try{return t()}finally{je()}}var J,w=void 0;function Le(t){var e=w,i=J;w=void 0,J=void 0;try{return t()}finally{w=e,J=i}}var ee=void 0,V=0,xe=0,Ai=0,Ee=0,we=void 0,ye=0;function Ut(t){if(w!==void 0){var e=t.n;if(e===void 0||e.t!==w)return e={i:0,S:t,p:w.s,n:void 0,t:w,e:void 0,x:void 0,r:e},w.s!==void 0&&(w.s.n=e),w.s=e,t.n=e,32&w.f&&t.S(e),e;if(e.i===-1)return e.i=0,e.n!==void 0&&(e.n.p=e.p,e.p!==void 0&&(e.p.n=e.n),e.p=w.s,e.n=void 0,w.s.n=e,w.s=e),e}}function z(t,e){this.v=t,this.i=0,this.n=void 0,this.t=void 0,this.l=0,this.W=e==null?void 0:e.watched,this.Z=e==null?void 0:e.unwatched,this.name=e==null?void 0:e.name}z.prototype.brand=Ci;z.prototype.h=function(){return!0};z.prototype.S=function(t){var e=this,i=this.t;i!==t&&t.e===void 0&&(t.x=i,this.t=t,i!==void 0?i.e=t:Le(function(){var o;(o=e.W)==null||o.call(e)}))};z.prototype.U=function(t){var e=this;if(this.t!==void 0){var i=t.e,o=t.x;i!==void 0&&(i.x=o,t.e=void 0),o!==void 0&&(o.e=i,t.x=void 0),t===this.t&&(this.t=o,o===void 0&&Le(function(){var n;(n=e.Z)==null||n.call(e)}))}};z.prototype.subscribe=function(t){var e=this;return re(function(){var i=e.value;Le(function(){return t(i)})},{name:"sub"})};z.prototype.valueOf=function(){return this.value};z.prototype.toString=function(){return this.value+""};z.prototype.toJSON=function(){return this.value};z.prototype.peek=function(){var t=this;return Le(function(){return t.value})};Object.defineProperty(z.prototype,"value",{get:function(){var t=Ut(this);return t!==void 0&&(t.i=this.i),this.v},set:function(t){if(t!==this.v){if(xe>100)throw new Error("Cycle detected");(function(i){V!==0&&xe===0&&i.l!==Ee&&(i.l=Ee,we={S:i,v:i.v,i:i.i,o:we})})(this),this.v=t,this.i++,ye++,V++;try{for(var e=this.t;e!==void 0;e=e.x)e.t.N()}finally{je()}}}});function Q(t,e){return new z(t,e)}function qt(t){for(var e=t.s;e!==void 0;e=e.n)if(e.S.i!==e.i||!e.S.h()||e.S.i!==e.i)return!0;return!1}function Kt(t){for(var e=t.s;e!==void 0;e=e.n){var i=e.S.n;if(i!==void 0&&(e.r=i),e.S.n=e,e.i=-1,e.n===void 0){t.s=e;break}}}function Xt(t){for(var e=t.s,i=void 0;e!==void 0;){var o=e.p;e.i===-1?(e.S.U(e),o!==void 0&&(o.n=e.n),e.n!==void 0&&(e.n.p=o)):i=e,e.S.n=e.r,e.r!==void 0&&(e.r=void 0),e=o}t.s=i}function G(t,e){z.call(this,void 0,e),this.x=t,this.s=void 0,this.g=ye-1,this.f=4}G.prototype=new z;G.prototype.h=function(){if(this.f&=-3,1&this.f)return!1;if((36&this.f)==32||(this.f&=-5,this.g===ye))return!0;if(this.g=ye,this.f|=1,this.i>0&&!qt(this))return this.f&=-2,!0;var t=w;try{Kt(this),w=this;var e=this.x();(16&this.f||this.v!==e||this.i===0)&&(this.v=e,this.f&=-17,this.i++)}catch(i){this.v=i,this.f|=16,this.i++}return w=t,Xt(this),this.f&=-2,!0};G.prototype.S=function(t){if(this.t===void 0){this.f|=36;for(var e=this.s;e!==void 0;e=e.n)e.S.S(e)}z.prototype.S.call(this,t)};G.prototype.U=function(t){if(this.t!==void 0&&(z.prototype.U.call(this,t),this.t===void 0)){this.f&=-33;for(var e=this.s;e!==void 0;e=e.n)e.S.U(e)}};G.prototype.N=function(){if(!(2&this.f)){this.f|=6;for(var t=this.t;t!==void 0;t=t.x)t.t.N()}};Object.defineProperty(G.prototype,"value",{get:function(){if(1&this.f)throw new Error("Cycle detected");var t=Ut(this);if(this.h(),t!==void 0&&(t.i=this.i),16&this.f)throw this.v;return this.v}});function Fe(t,e){return new G(t,e)}function Zt(t){var e=t.m;if(t.m=void 0,typeof e=="function"){V++;var i=w;w=void 0;try{e()}catch(o){throw t.f&=-2,t.f|=8,Ze(t),o}finally{w=i,je()}}}function Ze(t){for(var e=t.s;e!==void 0;e=e.n)e.S.U(e);t.x=void 0,t.s=void 0,Zt(t)}function $i(t){if(w!==this)throw new Error("Out-of-order effect");Xt(this),w=t,this.f&=-2,8&this.f&&Ze(this),je()}function B(t,e){this.x=t,this.m=void 0,this.s=void 0,this.u=void 0,this.f=32,this.name=e==null?void 0:e.name,J&&J.push(this)}B.prototype.c=function(){var t=this.S();try{if(8&this.f||this.x===void 0)return;var e=this.x();typeof e=="function"&&(this.m=e)}finally{t()}};B.prototype.S=function(){if(1&this.f)throw new Error("Cycle detected");this.f|=1,this.f&=-9,Zt(this),Kt(this),V++;var t=w;return w=this,$i.bind(this,t)};B.prototype.N=function(){2&this.f||(this.f|=2,this.u=ee,ee=this)};B.prototype.d=function(){this.f|=8,1&this.f||Ze(this)};B.prototype.dispose=function(){this.d()};function re(t,e){var i=new B(t,e);try{i.c()}catch(n){throw i.d(),n}var o=i.d.bind(i);return o[Symbol.dispose]=o,o}var Jt,pe,Qi=typeof window<"u"&&!!window.__PREACT_SIGNALS_DEVTOOLS__,ei=[];re(function(){Jt=this.N})();function U(t,e){f[t]=e.bind(null,f[t]||function(){})}function ie(t){if(pe){var e=pe;pe=void 0,e()}pe=t&&t.S()}function ti(t){var e=this,i=t.data,o=Vi(i);o.name="ReactiveDom",o.value=i;var n=Ke(function(){for(var l=e,c=e.__v;c=c.__;)if(c.__c){c.__c.__$f|=4;break}var p=Fe(function(){var k=o.value.value;return k===0?0:k===!0?"":k||""}),d=Fe(function(){return!Array.isArray(p.value)&&!Qt(p.value)}),u=re(function(){if(this.N=ii,d.value){var k=p.value;l.__v&&l.__v.__e&&l.__v.__e.nodeType===3&&(l.__v.__e.data=k)}}),s=e.__$u.d;return e.__$u.d=function(){u(),s.call(this)},[d,p]},[]),r=n[0],a=n[1];return r.value?a.peek():a.value}ti.displayName="ReactiveTextNode";Object.defineProperties(z.prototype,{constructor:{configurable:!0,value:void 0},type:{configurable:!0,value:ti},props:{configurable:!0,get:function(){var t=this;return{data:{get value(){return t.value}}}}},__b:{configurable:!0,value:1}});U("__b",function(t,e){if(ie(),typeof e.type=="string"){var i,o=e.props;for(var n in o)if(n!=="children"){var r=o[n];r instanceof z&&(i||(e.__np=i={}),i[n]=r,o[n]=r.peek())}}t(e)});U("__r",function(t,e){if(t(e),e.type!==oe){ie();var i,o=e.__c;o&&(o.__$f&=-2,(i=o.__$u)===void 0&&(o.__$u=i=(function(n,r){var a;return re(function(){a=this},{name:r}),a.c=n,a})((function(n){return function(){var r;Qi&&((r=this.y)==null||r.call(this)),n.__$f|=1,n.setState({})}})(o),typeof e.type=="function"?e.type.displayName||e.type.name:""))),ie(i)}});U("__e",function(t,e,i,o){ie(),t(e,i,o)});U("diffed",function(t,e){ie();var i;if(typeof e.type=="string"&&(i=e.__e)){var o=e.__np,n=e.props,r=i.U;if(r)for(var a in r){var l=r[a];l===void 0||o&&a in o||(l.d(),r[a]=void 0)}if(o){r||(r={},i.U=r);for(var c in o){var p=r[c],d=o[c];p===void 0?(p=Pi(i,c,d,n),r[c]=p):p.o(d,n)}}}t(e)});function Pi(t,e,i,o){var n=e in t&&t.ownerSVGElement===void 0,r=Q(i);return{o:function(a,l){r.value=a,o=l},d:re(function(){this.N=ii;var a=r.value.value;o[e]!==a&&(o[e]=a,n?t[e]=a:a!=null&&(a!==!1||e[4]==="-")?t.setAttribute(e,a):t.removeAttribute(e))})}}U("unmount",function(t,e){if(typeof e.type=="string"){var i=e.__e;if(i){var o=i.U;if(o){i.U=void 0;for(var n in o){var r=o[n];r&&r.d()}}}var a=e.__np;if(a){var l=e.props;for(var c in a)l[c]=a[c]}e.__np=void 0}else{var p=e.__c;if(p){p.__$f|=8;var d=p.__$u;d&&(p.__$u=void 0,d.d())}}t(e)});U("__h",function(t,e,i,o){o<3&&(e.__$f|=2),t(e,i,o)});Z.prototype.shouldComponentUpdate=function(t,e){if(this.__R)return!0;var i=this.__$u,o=i&&i.s!==void 0;for(var n in e)return!0;if(this.__f||typeof this.u=="boolean"&&this.u===!0){var r=2&this.__$f;if(!(o||r||4&this.__$f)||1&this.__$f)return!0}else if(!(o||4&this.__$f)||3&this.__$f)return!0;for(var a in t)if(a!=="__source"&&t[a]!==this.props[a])return!0;for(var l in this.props)if(!(l in t))return!0;return!1};function Vi(t,e){return Ke(function(){return Q(t,e)},[])}var Oi=function(t){queueMicrotask(function(){queueMicrotask(t)})};function Ni(){Hi(function(){for(var t;t=ei.shift();)Jt.call(t)})}function ii(){ei.push(this)===1&&(f.requestAnimationFrame||Oi)(Ni)}const Re={lang:"vg.party.lang",tvStage:"vg.party.tvStage"};function Ei(t,e){return`vg.party.${t}.${e}`}function Je(){try{return typeof localStorage>"u"?null:localStorage}catch{return null}}function ke(t){const e=Je();if(!e)return null;try{const i=e.getItem(t);return i===null?null:JSON.parse(i)}catch{return null}}function Ae(t,e){var i;try{(i=Je())==null||i.setItem(t,JSON.stringify(e))}catch{}}function Fi(t){var e;try{(e=Je())==null||e.removeItem(t)}catch{}}function Ri(t,e){typeof window>"u"||window.addEventListener("storage",i=>{const o=i;if(o.key!==t())return;let n=null;try{n=o.newValue===null?null:JSON.parse(o.newValue)}catch{}e(n)})}const Di=[.875,1,1.125,1.25,1.5],ut=(t,e)=>Object.prototype.hasOwnProperty.call(t,e),$e=(t,e)=>Object.is(t,e)||JSON.stringify(t)===JSON.stringify(e),Y=t=>typeof t=="boolean",Ii=t=>t==="el"||t==="en",Gi=t=>typeof t=="number"&&Di.includes(t),Wi=t=>t==="system"||t==="calm",Qe=t=>typeof t=="number"&&Number.isFinite(t)&&t>=0&&t<=1,Yi=t=>typeof t=="object"&&t!==null&&Qe(t.music)&&Qe(t.voice)&&Qe(t.effects),Bi={music:1,voice:1,effects:1};function Ui(){let t=null,e=null,i=null,o=!1;const n=[];let r=null;const a=d=>e!==null&&!d.local&&t!==null&&d.game()===t;function l(){if(e===null||!o)return;const d=e.values,u={};for(const s of n){if(!a(s)||ut(d,s.key))continue;const k=s.chosen();k!==void 0&&(u[s.key]=k)}e.fill(u)}function c(d,u,s,k={}){const v=k.game??null,T=k.legacy??`vg.party.${d}`,b=k.legacy??(v===null?T:null),x=new Set,m=()=>v??t,S=()=>{const g=m();return g!==null?Ei(g,d):T},N=()=>{const g=S(),E=ke(g);if(s(E))return E;if(b!==null&&b!==g){const j=ke(b);if(s(j))return Ae(g,j),j}return u};let L=N();const H=g=>{if(!$e(g,L)){L=g;for(const E of[...x])E(g)}},K={key:d,local:k.local===!0,game:m,deviceKey:S,chosen(){const g=ke(S());return s(g)&&!$e(g,u)?g:void 0},bind:()=>H(N()),take(g){!s(g)||$e(g,L)||(Ae(S(),g),H(g))}};return n.push(K),Ri(S,g=>H(s(g)?g:u)),{get:()=>L,set(g){Ae(S(),g),H(g),e!==null&&a(K)&&(e.set({[d]:g}),l())},watch(g){return x.add(g),()=>{x.delete(g)}}}}function p(d,u){for(const s of n)!a(s)||u!==void 0&&!u.includes(s.key)||!ut(d,s.key)||s.take(d[s.key])}return{setting:c,kitSettings(){return r??(r={language:c("language",null,Ii,{legacy:Re.lang}),music:c("music",!0,Y),sounds:c("sounds",!0,Y),voice:c("voice",!0,Y),vibration:c("vibration",!0,Y),gamePicture:c("gamePicture",!1,Y),textScale:c("textScale",1,Gi),motion:c("motion","system",Wi),captions:c("captions",!1,Y),loudness:c("loudness",Bi,Yi,{local:!0})}),r},name(d){if(t!==d){t=d;for(const u of n)u.bind();e!==null&&(p(e.values),l())}},sync(d){i==null||i(),e=d,o=!1;let u=!0;p(d.values);const s=d.watch((v,T,b)=>{u&&(p(v,T),b==="vhub"&&l())});d.ready().then(()=>{u&&(o=!0,p(d.values),l())},()=>{});const k=()=>{u&&(u=!1,s(),e===d&&(e=null,i=null,o=!1))};return i=k,k}}}const qi=Ui(),C=qi.kitSettings(),O={language:C.language,music:C.music,sounds:C.sounds,voice:C.voice,vibration:C.vibration,gamePicture:C.gamePicture,textScale:C.textScale,motion:C.motion,captions:C.captions};C.gamePicture;C.loudness;const Do="pk-sr",oi=Q(O.textScale.get());O.textScale.watch(t=>{oi.value=t});const ni=Q(O.motion.get());O.motion.watch(t=>{ni.value=t});const De=Q(!1);var At;if(typeof window<"u"&&typeof window.matchMedia=="function"){const t=window.matchMedia("(prefers-reduced-motion: reduce)");De.value=t.matches,(At=t.addEventListener)==null||At.call(t,"change",e=>{De.value=e.matches})}const et=Fe(()=>ni.value==="calm"||De.value),Ki=Q(O.captions.get());O.captions.watch(t=>{Ki.value=t});let gt=!1;function Xi(){gt||(gt=!0,typeof Object.hasOwn!="function"&&Object.defineProperty(Object,"hasOwn",{value:(t,e)=>Object.prototype.hasOwnProperty.call(t,e),configurable:!0,writable:!0}))}const Zi=["el","en"],Ji={"kit.next":"Συνέχεια","kit.done":"Έτοιμο","kit.cancel":"Άκυρο","kit.close":"Κλείσιμο","kit.save":"Αποθήκευση","kit.on":"Ναι","kit.off":"Όχι","kit.less":"Λιγότερο","kit.more":"Περισσότερο","kit.paused":"Παύση από τον οικοδεσπότη","kit.reconnecting":"Επανασύνδεση…","kit.players":"Παίκτες","kit.captions":"Τα λόγια της αφήγησης","kit.time.seconds":"{n} δευτ.","kit.time.minutes":"{n, plural, one {# λεπτό} other {# λεπτά}}","kit.time.minutesSeconds":"{m, plural, one {# λεπτό} other {# λεπτά}} {s} δευτ.","kit.timer.left":"Απομένουν {time}","kit.timer.paused":"Σε παύση, απομένουν {time}","kit.input.invalid":"Αυτό δεν μέτρησε. Δοκίμασε ξανά.","kit.input.step":"Πολύ αργά: αυτό το κομμάτι τελείωσε.","kit.input.late":"Πολύ αργά: ο χρόνος τελείωσε.","kit.input.paused":"Ο οικοδεσπότης έβαλε το παιχνίδι σε παύση.","kit.input.over":"Το παιχνίδι τελείωσε.","kit.join.title":"Μπες στο παιχνίδι","kit.join.codeLabel":"Κωδικός δωματίου","kit.join.codeHelp":"Τα έξι ψηφία στην τηλεόραση ή στο κινητό του οικοδεσπότη.","kit.join.year":"Έτος γέννησης","kit.join.yearFormat":"ΕΕΕΕ","kit.join.yearKept":"Κρατάμε μόνο την ηλικιακή ομάδα, ποτέ το έτος.","kit.join.yearWrong":"Γράψε το έτος με τέσσερα ψηφία.","kit.join.under":"Τα παιχνίδια αυτά είναι για ηλικίες 13 και πάνω.","kit.join.room":"Δωμάτιο {code}","kit.join.changeCode":"Αλλαγή","kit.join.vhubName":"Το όνομά σου στο VHub","kit.join.nickname":"Το όνομά σου σε αυτό το δωμάτιο","kit.join.nicknameHelp":"Από 2 έως 16 γράμματα ή ψηφία. Το βλέπει μόνο αυτό το δωμάτιο.","kit.join.avatar":"Η εικόνα σου","kit.join.avatarN":"Εικόνα {n}","kit.join.join":"Μπες","kit.join.joining":"Μπαίνεις…","kit.join.watch":"Παρακολούθηση","kit.join.code":"Δεν υπάρχει δωμάτιο με αυτόν τον κωδικό. Κοίτα την τηλεόραση και δοκίμασε ξανά.","kit.join.gone":"Αυτό το δωμάτιο έκλεισε.","kit.join.locked":"Το δωμάτιο είναι κλειδωμένο. Ζήτα από τον οικοδεσπότη να το ανοίξει.","kit.join.full":"Το δωμάτιο είναι γεμάτο.","kit.join.started":"Το παιχνίδι έχει ξεκινήσει και το δωμάτιο δεν δέχεται θεατές.","kit.join.kicked":"Ο οικοδεσπότης σε αφαίρεσε από το δωμάτιο.","kit.join.limited":"Πάρα πολλοί λάθος κωδικοί. Δοκίμασε ξανά σε λίγο.","kit.watching.started":"Το παιχνίδι είχε ήδη ξεκινήσει, οπότε παρακολουθείς. Θα παίξεις στο επόμενο.","kit.watching.full":"Οι θέσεις ήταν γεμάτες, οπότε παρακολουθείς.","kit.display.full":"Το δωμάτιο έχει ήδη τέσσερις οθόνες.","kit.display.demoFull":"Αυτή η δοκιμαστική παρτίδα έχει ήδη δύο οθόνες.","kit.display.key":"Δεν υπάρχει δωμάτιο με αυτόν τον κωδικό τηλεόρασης. Δες το «Στην τηλεόραση» στο κινητό του οικοδεσπότη και δοκίμασε ξανά.","kit.pair.code":"Καμία οθόνη δεν δείχνει τώρα αυτόν τον κωδικό. Κοίτα τον κωδικό στην τηλεόραση και δοκίμασε ξανά.","kit.pair.tvCode":"Αυτός είναι κωδικός τηλεόρασης δωματίου. Γράψ' τον στην τηλεόραση, στο vgraphics.gr/tv.","kit.limit.pairs":"Αυτή η οθόνη ζήτησε πάρα πολλούς κωδικούς. Δοκίμασε ξανά σε λίγο.","kit.limit.codes":"Πάρα πολλοί λάθος κωδικοί από αυτή τη συσκευή. Δοκίμασε ξανά σε μία ώρα.","kit.net.failed":"Κάτι δεν πήγε καλά. Έλεγξε τη σύνδεσή σου και δοκίμασε ξανά.","kit.room.closed":"Αυτό το δωμάτιο έκλεισε.","kit.room.notNow":"Όχι αυτή τη στιγμή.","kit.room.notMember":"Δεν είσαι πια σε αυτό το δωμάτιο.","kit.host.only":"Αυτό μπορεί να το κάνει μόνο ο οικοδεσπότης.","kit.host.tools":"Οικοδεσπότης","kit.host.pause":"Παύση","kit.host.resume":"Συνέχεια","kit.host.paused":"Σε παύση","kit.start.host":"Για να ξεκινήσει, ο οικοδεσπότης πρέπει να είναι παίκτης.","kit.start.rules":"Με αυτούς τους κανόνες δεν μπορεί να ξεκινήσει ακόμη το παιχνίδι.","kit.name.short":"Τουλάχιστον 2 γράμματα.","kit.name.long":"Έως 16 γράμματα.","kit.name.chars":"Μόνο γράμματα, ψηφία, κενά και . - _ '","kit.name.rude":"Αυτό το όνομα δεν επιτρέπεται. Δοκίμασε άλλο.","kit.rules.title":"Κανόνες","kit.rules.preset":"Έτοιμοι κανόνες","kit.rules.custom":"Προσαρμοσμένοι","kit.rules.noLimit":"Χωρίς όριο χρόνου","kit.rules.auto":"Αυτόματο","kit.rules.balance":"Ισορροπία","kit.rules.saveMine":"Αποθήκευση ως «Οι κανόνες μου»","kit.rules.card":"Κανόνες","kit.rules.changed":"άλλαξε","kit.rules.lang":"Γλώσσα δωματίου","kit.rules.narrator":"Αφήγηση","kit.rules.narrator.help":"Χωρίς αφήγηση μένουν οι υπότιτλοι και οι ήχοι.","kit.rules.relaxed":"Χαλαροί χρόνοι","kit.rules.relaxed.help":"Κάθε χρονικό όριο γίνεται μιάμιση φορά μεγαλύτερο.","kit.rules.tooFew":"{min, plural, one {Χρειάζεται τουλάχιστον # παίκτης.} other {Χρειάζονται τουλάχιστον # παίκτες.}}","kit.rules.tooMany":"{max, plural, one {Μπορεί να παίξει έως # παίκτης.} other {Μπορούν να παίξουν έως # παίκτες.}}","kit.status.host":"Οικοδεσπότης","kit.status.out":"Εκτός","kit.status.offline":"Χωρίς σύνδεση","kit.status.ready":"Έτοιμος/η","kit.status.level":"Επίπεδο","kit.progress.title":"Η πρόοδός σου","kit.progress.waiting":"Μετράμε τα XP σου…","kit.progress.gained":"+{xp, number} XP","kit.progress.coins":"+{coins, number} νομίσματα","kit.progress.none":"Κανένα νέο XP σε αυτό το παιχνίδι","kit.progress.capped":"Πήρες όλα τα σημερινά XP από αυτό το παιχνίδι. Κι άλλα αύριο.","kit.progress.level":"Επίπεδο {level}","kit.progress.levelUp":"Ανέβηκες επίπεδο!","kit.progress.bar":"Επίπεδο {level}: {into, number} από {needed, number} XP","kit.progress.toNext":"{n, number} XP ως το επίπεδο {next}","kit.progress.unlocked":"{n, plural, one {Νέο επίτευγμα} other {# νέα επιτεύγματα}}","kit.progress.achievement":"Νέο επίτευγμα","kit.progress.tier.bronze":"Χάλκινο","kit.progress.tier.silver":"Ασημένιο","kit.progress.tier.gold":"Χρυσό","kit.progress.keep":"Συνδέσου για να κρατήσεις τα XP σου","kit.progress.keepHelp":"Παίζεις ως επισκέπτης, οπότε τα XP σου μένουν σε αυτό το κινητό. Συνδέσου με Google για να τα έχεις σε κάθε συσκευή.","kit.progress.earn":"Συνδέσου για να κερδίζεις XP","kit.progress.earnHelp":"Με λογαριασμό VHub, κάθε παιχνίδι σού δίνει XP, επίπεδα και επιτεύγματα.","kit.progress.signIn":"Σύνδεση","ach.vhub.room-regular":"Θαμώνας","ach.vhub.room-regular.about":"Παίξε 10 παιχνίδια σε δωμάτια, σε όποιο παιχνίδι θέλεις.","ach.vhub.champion":"Νίκες παντού","ach.vhub.champion.about":"Κέρδισε σε δωμάτιο σε δύο διαφορετικά παιχνίδια.","ach.vhub.level-10":"Επίπεδο 10","ach.vhub.level-10.about":"Φτάσε στο επίπεδο 10 του VHub.","ach.vhub.level-25":"Επίπεδο 25","ach.vhub.level-25.about":"Φτάσε στο επίπεδο 25 του VHub.","ach.vhub.level-50":"Επίπεδο 50","ach.vhub.level-50.about":"Φτάσε στο επίπεδο 50 του VHub.","ach.vhub.level-100":"Επίπεδο 100","ach.vhub.level-100.about":"Φτάσε στο επίπεδο 100 του VHub.","kit.tv.qr":"Κωδικός QR για να μπεις στο δωμάτιο","kit.tv.joinHelp":"Στρέψε την κάμερα του κινητού στον κωδικό, ή άνοιξε τη σελίδα και γράψε τα έξι ψηφία.","kit.tv.sound":"Πάτησε OK για ήχο","kit.tv.leave":"Να βγει αυτή η τηλεόραση από το δωμάτιο;","kit.tv.stay":"Μένουμε","kit.tv.leaveYes":"Έξοδος","kit.tv.title":"Στην τηλεόραση","kit.tv.step1":"Στην τηλεόραση, άνοιξε το πρόγραμμα περιήγησης και πήγαινε στο {site}.","kit.tv.step2":"Γράψε τον κωδικό τηλεόρασης {code} με το τηλεχειριστήριο.","kit.tv.link":"Ή άνοιξε αυτόν τον σύνδεσμο στην οθόνη, για παράδειγμα σε ένα λάπτοπ:","kit.tv.copied":"Ο σύνδεσμος αντιγράφηκε. Άνοιξέ τον στο πρόγραμμα περιήγησης της οθόνης.","kit.tv.noMirror":"Μην προβάλλεις την οθόνη του κινητού σου στην τηλεόραση: θα έβλεπαν όλοι τα μυστικά σου.","kit.tv.tableMode":"Χωρίς τηλεόραση; Το κινητό σου γίνεται το τραπέζι","kit.tv.joinAt":"Μπες από το","kit.tv.roomCode":"Κωδικός δωματίου","kit.tv.howTo":"Πώς παίζεται","kit.tv.freeSeat":"Κενή θέση","kit.tv.faceDown":"Η κάρτα μένει κλειστή","kit.tv.awards":"Βραβεία","kit.tvCode.label":"Κωδικός τηλεόρασης","kit.tvCode.keypad":"Πλήκτρα αριθμών","kit.tvCode.delete":"Διαγραφή","kit.tvCode.ok":"OK","kit.tvCode.pairing":"Αυτός είναι ο κωδικός που δείχνει η οθόνη για τη δοκιμαστική παρτίδα. Γράψ' τον στο κινητό σου, στη δοκιμαστική παρτίδα.","kit.tvPair.qr":"Κωδικός QR που ανοίγει τη δοκιμαστική παρτίδα στο κινητό σου","kit.tvPair.code":"Κωδικός παρτίδας","kit.tvPair.help":"Σκάναρε το QR με την κάμερα του κινητού σου, ή γράψε τον κωδικό στη δοκιμαστική παρτίδα.","kit.tvHelp.type":"Στην τηλεόραση, άνοιξε το {site} στο πρόγραμμα περιήγησης και γράψε αυτόν τον κωδικό τηλεόρασης με το τηλεχειριστήριο:","kit.tvHelp.or":"ή γράψε τον στο {site}","kit.tvHelp.link":"Ή άνοιξε αυτόν τον σύνδεσμο στην τηλεόραση ή σε υπολογιστή:","kit.tvHelp.share":"Κοινοποίηση συνδέσμου","kit.tvHelp.copied":"Ο σύνδεσμος αντιγράφηκε","kit.tvHelp.again":"Έκλεισε η τηλεόραση; Άνοιξε ξανά τον ίδιο σύνδεσμο ή γράψε ξανά τον ίδιο κωδικό: ξαναμπαίνει σε αυτό το δωμάτιο.","kit.tvHelp.join":"οι άλλοι μπαίνουν από το {site}","kit.tvHelp.showing":"Η τηλεόραση δείχνει κωδικό; Γράψ' τον εδώ:","kit.tvHelp.connect":"Σύνδεση","kit.tvHelp.paired":"Η τηλεόρασή σου μπαίνει.","kit.lobby.needMore":"{n, plural, one {Περιμένουμε ακόμη # παίκτη} other {Περιμένουμε ακόμη # παίκτες}}","kit.lobby.waitingHost":"Περιμένουμε την έναρξη · οικοδεσπότης: {name}","kit.lobby.seats":"Παίκτες: {n} από {min}","kit.lobby.watchingCount":"{n, plural, one {# παρακολουθεί} other {# παρακολουθούν}}","kit.lobby.copied":"Ο σύνδεσμος αντιγράφηκε. Επικόλλησέ τον σε ένα μήνυμα.","kit.lobby.inviteLink":"Στείλε αυτόν τον σύνδεσμο: {link}","kit.lobby.rename":"Αλλαγή ονόματος","kit.lobby.ready":"Έτοιμος/η","kit.lobby.getReady":"Είμαι έτοιμος/η","kit.lobby.play":"Θέλω να παίξω","kit.lobby.watching":"Παρακολουθείς αυτό το παιχνίδι.","kit.lobby.start":"Έναρξη","kit.lobby.rules":"Κανόνες","kit.lobby.invite":"Πρόσκληση","kit.lobby.tv":"Στην τηλεόραση","kit.lobby.lock":"Κλείδωμα","kit.lobby.locked":"Κλειδωμένο","kit.lobby.kickTitle":"Αφαίρεση από το δωμάτιο;","kit.lobby.kick":"Αφαίρεση","kit.invite.title":"Έλα να παίξουμε","kit.invite.text":"Μπες στο δωμάτιό μου: κωδικός {code}","kit.invite.send":"Στείλε στους φίλους σου αυτόν τον σύνδεσμο","kit.invite.copy":"Αντιγραφή συνδέσμου","kit.invite.scan":"Ή σκανάρουν αυτόν τον κωδικό με την κάμερα του κινητού τους.","kit.consent.title":"Επιλογή απορρήτου","kit.consent.text":"Μας επιτρέπεις να μετράμε πώς παίζεται το παιχνίδι (με το Google Analytics), για να διορθώνουμε προβλήματα και να το κάνουμε καλύτερο;","kit.consent.privacy":"Πολιτική απορρήτου","kit.consent.deny":"Δεν επιτρέπω","kit.consent.allow":"Επιτρέπω","kit.ads.label":"Διαφήμιση","kit.ads.test":"Δοκιμαστική διαφήμιση","kit.ads.tvPlaying":"Η τηλεόραση δείχνει μια σύντομη διαφήμιση. Μπορείς να ξεκινήσεις μόλις τελειώσει.","kit.ads.off":"Αυτό το δωμάτιο δεν δείχνει διαφημίσεις.","kit.pass.thanks":"Χωρίς διαφημίσεις απόψε, χάρη στο Host Pass του/της {name}","kit.pass.nudgeTitle":"Ξεφορτώσου τις διαφημίσεις για πάντα","kit.pass.nudgeBody":"Host Pass · {price} εφάπαξ","kit.pass.nudgeLines":`Χωρίς διαφημίσεις στα κινητά των δωματίων σου
Χωρίς βίντεο στην τηλεόραση ανάμεσα στα παιχνίδια
Πληρώνεις μία φορά και ισχύει σε κάθε δωμάτιο που ανοίγεις`,"kit.pass.see":"Δες το Host Pass","kit.pass.notNow":"Όχι τώρα","kit.store.title":"Κατάστημα","kit.store.balance":"Τα νομίσματά σου: {coins, number}","kit.store.tabs":"Ενότητες του καταστήματος","kit.store.sets":"Σετ","kit.store.looks":"Στυλ","kit.store.pass":"Host Pass","kit.store.empty":"Έρχονται νέα στυλ.","kit.store.worth":"Αξίζει {coins, number} νομίσματα αν τα πάρεις ένα-ένα","kit.store.coinPrice":"{coins, number} νομίσματα","kit.store.inPacks":"{euro} σε πακέτα νομισμάτων","kit.store.buy":"Αγορά","kit.store.yours":"Δικό σου","kit.store.equip":"Φόρεσέ το","kit.store.unequip":"Βγάλτο","kit.store.short":"Λείπουν {n, number} νομίσματα","kit.store.partOwned":"Έχεις ήδη μερικά από αυτά. Πάρε τα υπόλοιπα ένα-ένα.","kit.store.askHost":"Ρώτα όποιον οργανώνει τη βραδιά","kit.store.signIn":"Συνδέσου για να αγοράσεις","kit.store.signInHelp":"Τα στυλ ανήκουν στον λογαριασμό σου στο VHub, οπότε σε ακολουθούν σε κάθε συσκευή.","kit.store.holds":"Τι περιλαμβάνει","kit.store.slot.portrait":"Πορτρέτο","kit.store.slot.seal":"Κέρινη σφραγίδα","kit.store.slot.cardBack":"Πίσω πλευρά κάρτας","kit.store.slot.plate":"Πλαίσιο ονόματος","kit.hold.see":"Κράτα πατημένο για να δεις","kit.hold.screenReader":"Ο αναγνώστης οθόνης διαβάζει την κάρτα φωναχτά: φόρεσε ακουστικά.","kit.secret.title":"Μυστικές ενέργειες","kit.secret.none":"Καμία μυστική ενέργεια τώρα.","kit.secret.hold":"Κράτα πατημένο για να ανοίξει. Το έχουν όλα τα κινητά.","kit.phone.keepOn":"Κράτα την οθόνη ανοιχτή στο παιχνίδι, αλλιώς το κινητό μπορεί να αποσυνδεθεί.","kit.phone.views":"Προβολές","kit.phone.you":"Εσύ","kit.phone.table":"Τραπέζι","kit.phone.room":"Δωμάτιο","kit.phone.menu":"Μενού","kit.account.signIn":"Σύνδεση στο VHub","kit.account.yours":"Ο λογαριασμός σου στο VHub","kit.account.yoursLevel":"Ο λογαριασμός σου στο VHub, επίπεδο {level}","kit.friend.add":"Προσθήκη φίλου","kit.friend.sent":"Ζητήθηκε","kit.friend.cancel":"Ακύρωση","kit.friend.accept":"Αποδοχή","kit.friend.friends":"Φίλοι","kit.friend.signIn":"Συνδέσου για να προσθέτεις φίλους","kit.friend.saidSent":"Το αίτημα στάλθηκε. Θα γίνετε φίλοι μόλις το αποδεχτεί.","kit.friend.saidExists":"Έχεις ήδη στείλει αίτημα. Θα το δει.","kit.friend.saidFriends":"Είστε πλέον φίλοι.","kit.friend.saidMutual":"Είστε πλέον φίλοι: σου είχε ήδη στείλει αίτημα.","kit.friend.saidLimit":"Έστειλες όσα αιτήματα φιλίας επιτρέπονται σήμερα. Δοκίμασε ξανά αύριο.","kit.friend.saidPending":"50 αιτήματά σου περιμένουν απάντηση. Ακύρωσε κάποια ή περίμενε να σου απαντήσουν.","kit.friend.saidFull":"Ένας από τους δύο έχει ήδη τους περισσότερους φίλους που επιτρέπει το VHub.","kit.friend.saidCant":"Δεν μπορείς να προσθέσεις αυτόν τον παίκτη.","kit.friend.saidGone":"Αυτός ο παίκτης δεν υπάρχει πια.","kit.friend.saidAge":"Οι φίλοι είναι για μεγαλύτερους παίκτες.","kit.friend.saidError":"Δεν έγινε. Έλεγξε τη σύνδεσή σου και δοκίμασε ξανά.","kit.friend.cancelled":"Ακυρώθηκε το αίτημα προς {name}","kit.friend.cancelledAnon":"Το αίτημα ακυρώθηκε","kit.friend.notCancelled":"Δεν ακυρώθηκε το αίτημα προς {name}","kit.friend.notCancelledAnon":"Το αίτημα δεν ακυρώθηκε","kit.toast.undo":"Αναίρεση","kit.connection.online":"Συνδεδεμένο","kit.connection.reconnecting":"Επανασύνδεση","kit.connection.offline":"Χωρίς σύνδεση","kit.help.row":"Βοήθεια και ιδέες","kit.help.rowHelp":"Κάτι δεν πάει καλά, ένα σφάλμα ή μια ιδέα; Πες μας και δες τις απαντήσεις μας","kit.help.answered":"Η VGraphics σου απάντησε","kit.help.group":"Βοήθεια","kit.help.lede":"Κάτι δεν πάει καλά, ένα σφάλμα, μια αγορά που δεν ολοκληρώθηκε ή μια ιδέα; Πες μας εδώ και δες τις απαντήσεις μας. Διαβάζουμε κάθε αίτημα.","kit.help.new":"Άνοιξε ένα αίτημα","kit.help.yours":"Τα αιτήματά σου","kit.help.newAnswers":"{n, plural, one {# νέα απάντηση} other {# νέες απαντήσεις}}","kit.help.count":"{n, plural, one {# αίτημα} other {# αιτήματα}}","kit.help.loading":"Φορτώνουν τα αιτήματά σου…","kit.help.loadFailed":"Τα αιτήματά σου δεν φόρτωσαν. Έλεγξε τη σύνδεσή σου και δοκίμασε ξανά.","kit.help.retry":"Δοκίμασε ξανά","kit.help.empty":"Κανένα αίτημα ακόμα","kit.help.emptyHere":"Κανένα αίτημα σε αυτό το πρόγραμμα περιήγησης ακόμα","kit.help.emptyLine":"Όταν ανοίξεις ένα, θα το βλέπεις εδώ μαζί με τις απαντήσεις μας.","kit.help.signedInLine":"Με τη σύνδεσή σου, τα αιτήματά σου σε ακολουθούν σε κάθε συσκευή.","kit.help.signedOut":"Συνδέσου και τα αιτήματά σου θα σε ακολουθούν σε κάθε συσκευή και σε κάθε παιχνίδι και εφαρμογή της VGraphics. Χωρίς λογαριασμό, τα κρατά αυτό το πρόγραμμα περιήγησης.","kit.help.signedOutList":"Αυτά είναι τα αιτήματα που κρατά αυτό το πρόγραμμα περιήγησης. Συνδέσου για να τα βλέπεις σε κάθε συσκευή.","kit.help.newAnswer":"Νέα απάντηση","kit.help.statusSr":"Κατάσταση:","kit.help.status.open":"Ανοιχτό","kit.help.status.answered":"Απαντήθηκε","kit.help.status.closed":"Έκλεισε","kit.help.status.fixed":"Διορθώθηκε","kit.help.status.done":"Έγινε","kit.help.status.planned":"Στα σχέδιά μας","kit.help.status.wont":"Δεν θα γίνει","kit.help.status.duplicate":"Διπλό","kit.help.status.noReply":"Χωρίς απάντηση","kit.help.status.in":"{status} στην {version}","kit.help.kind.problem":"Κάτι δεν πάει καλά","kit.help.kind.problemHelp":"Δεν λειτουργεί όπως θα έπρεπε.","kit.help.kind.bug":"Ένα σφάλμα","kit.help.kind.bugHelp":"Κάτι χάλασε, κόλλησε ή δείχνει λάθος.","kit.help.kind.idea":"Μια ιδέα","kit.help.kind.ideaHelp":"Κάτι που θα ήθελες να προσθέσουμε ή να αλλάξουμε.","kit.help.kind.purchase":"Μια αγορά","kit.help.kind.purchaseHelp":"Νομίσματα, ένα πάσο ή μια επαναφορά που δεν πήγε καλά.","kit.help.kind.other":"Κάτι άλλο","kit.help.kind.otherHelp":"Ό,τι άλλο θέλεις να μας πεις.","kit.help.about":"Για τι πρόκειται;","kit.help.whatHappened":"Τι έγινε;","kit.help.whatIdea":"Τι θα ήθελες;","kit.help.invalid":"Πες μας λίγο περισσότερα: τουλάχιστον 10 χαρακτήρες, και μια διεύθυνση email που λειτουργεί (ή καμία).","kit.help.emailMe":"Στείλε μου τις απαντήσεις με email","kit.help.emailMeHelp":"Στη διεύθυνση της σύνδεσής σου. Μπορείς πάντα να το παρακολουθείς και εδώ.","kit.help.email":"Το email σου (προαιρετικό)","kit.help.emailHelp":"Εκεί στέλνουμε τις απαντήσεις. Χωρίς αυτό, μπορείς να παρακολουθείς το αίτημα μόνο σε αυτό το πρόγραμμα περιήγησης.","kit.help.trap":"Ιστότοπος","kit.help.sentWith":"Στέλνεται μαζί: {device}","kit.help.send":"Αποστολή","kit.help.sending":"Αποστολή…","kit.help.sendFailed":"Δεν στάλθηκε. Έλεγξε τη σύνδεσή σου και δοκίμασε ξανά.","kit.help.limit":"Για την ώρα έφτασες τα περισσότερα αιτήματα. Δοκίμασε ξανά σε μία ώρα ή στείλε email στο support@vgraphics.gr.","kit.help.blocked":"Δεν μπορούμε να δεχτούμε αιτήματα από εδώ. Στείλε email στο support@vgraphics.gr.","kit.help.sent":"Ευχαριστούμε, το αίτημά σου άνοιξε","kit.help.sentLine":"Θα απαντήσουμε εδώ, μέσα στο παιχνίδι, και με email αν μας έδωσες.","kit.help.openIt":"Άνοιξε το αίτημά σου","kit.help.another":"Άνοιξε άλλο αίτημα","kit.help.back":"Πίσω","kit.help.vgraphics":"VGraphics","kit.help.you":"Εσύ","kit.help.meta":"{id} · άνοιξε {when}","kit.help.threadLoading":"Φορτώνει το αίτημα…","kit.help.threadFailed":"Το αίτημα δεν φόρτωσε. Έλεγξε τη σύνδεσή σου και δοκίμασε ξανά.","kit.help.reply":"Η απάντησή σου","kit.help.replyReopens":"Κάτι ακόμα; Μια απάντηση το ανοίγει ξανά.","kit.help.replyLimit":"Για την ώρα έφτασες τις περισσότερες απαντήσεις. Δοκίμασε ξανά σε μία ώρα.","kit.help.replyClosed":"Αυτό το αίτημα έκλεισε. Άνοιξε ένα καινούργιο.","kit.help.replyFailed":"Δεν στάλθηκε.","kit.help.closedNoReply":"Αυτό το αίτημα έκλεισε. Κάτι καινούργιο;","kit.help.openNew":"Άνοιξε νέο αίτημα","kit.help.closeTicket":"Κλείσε το αίτημα","kit.help.closedNote":"Έκλεισε. Μια απάντηση μέσα σε 30 ημέρες το ανοίγει ξανά.","kit.help.closeFailed":"Δεν έκλεισε. Έλεγξε τη σύνδεσή σου και δοκίμασε ξανά.","kit.help.notFound":"Δεν βρίσκουμε αυτό το αίτημα","kit.help.notFoundLine":"Άνοιξέ το από τον σύνδεσμο του email μας ή συνδέσου με τον λογαριασμό που το άνοιξε.","kit.help.offer.title":"Χρειάζεσαι βοήθεια ή έχεις μια ιδέα;","kit.help.offer.body":"Βρήκες ένα πρόβλημα, ένα σφάλμα ή κάτι που θα ήθελες να προσθέσουμε; Πες μας. Διαβάζουμε κάθε αίτημα.","kit.help.offer.later":"Όχι τώρα","kit.news.title":"Ενημερωτικό δελτίο","kit.news.lede":"Νέα για το {name}. Ένα email τον μήνα, το πολύ, και φεύγεις με ένα πάτημα.","kit.news.email":"Email","kit.news.emailOr":"Email (άφησέ το κενό για το {email})","kit.news.vgraphics":"Και τα νέα παιχνίδια και εφαρμογές της VGraphics","kit.news.consent":"Για άτομα 16 ετών και άνω. Ένα email τον μήνα, το πολύ. Διαγραφή με ένα πάτημα.","kit.news.signUp":"Γράψε με","kit.news.signingUp":"Γίνεται η εγγραφή…","kit.news.pending":"Έλεγξε τα εισερχόμενά σου","kit.news.pendingLine":"Στείλαμε έναν σύνδεσμο στο {email}. Πάτησέ τον για να ολοκληρωθεί η εγγραφή.","kit.news.change":"Αλλαγή διεύθυνσης","kit.news.signed":"Η εγγραφή σου ολοκληρώθηκε","kit.news.signedLine":"Τα νέα έρχονται στο {email}. Ένα email τον μήνα, το πολύ.","kit.news.signedInLine":"Τα νέα έρχονται στη διεύθυνση της σύνδεσής σου. Ένα email τον μήνα, το πολύ.","kit.news.manage":"Διαχείριση θεμάτων","kit.news.under16":"Το ενημερωτικό δελτίο είναι για άτομα 16 ετών και άνω.","kit.news.invalid":"Αυτό δεν μοιάζει με διεύθυνση email. Έλεγξέ τη και δοκίμασε ξανά.","kit.news.noEmail":"Γράψε τη διεύθυνση email όπου θα έρχονται τα νέα.","kit.news.age":"Τα νέα είναι για άτομα 16 ετών και άνω.","kit.news.noTopic":"Διάλεξε τουλάχιστον ένα θέμα.","kit.news.limit":"Ήρθαν πολλές εγγραφές από εδώ την τελευταία ώρα. Δοκίμασε ξανά σε μία ώρα.","kit.news.failed":"Δεν ολοκληρώθηκε. Έλεγξε τη σύνδεσή σου και δοκίμασε ξανά.","kit.menu.title":"Ρυθμίσεις","kit.menu.gamePicture":"Η εικόνα του χαρακτήρα μου αντί για του VHub","kit.menu.roomHelp":"Οι άλλοι μπαίνουν με αυτόν τον κωδικό.","kit.menu.language":"Γλώσσα","kit.menu.music":"Μουσική","kit.menu.sounds":"Ηχητικά εφέ","kit.menu.voice":"Φωνή αφηγητή","kit.menu.vibration":"Δόνηση","kit.menu.musicLevel":"Ένταση μουσικής","kit.menu.soundsLevel":"Ένταση ηχητικών εφέ","kit.menu.voiceLevel":"Ένταση αφηγητή","kit.menu.soundHelp":"Για το κινητό που παίζει τον ήχο του δωματίου, όταν δεν υπάρχει τηλεόραση.","kit.menu.textSize":"Μέγεθος κειμένου","kit.menu.captions":"Τα λόγια της αφήγησης στο κινητό μου","kit.menu.calm":"Λιγότερη κίνηση","kit.menu.analytics":"Βοήθησε να γίνει καλύτερο το παιχνίδι (Google Analytics)","kit.menu.adChoices":"Επιλογές διαφημίσεων","kit.menu.leaveSure":"Να φύγεις από το δωμάτιο; Μπορείς να ξαναμπείς με τον κωδικό.","kit.menu.leave":"Αποχώρηση","kit.menu.group.room":"Σε αυτό το δωμάτιο","kit.menu.group.sound":"Ήχος","kit.menu.group.reading":"Ανάγνωση","kit.menu.group.you":"Εσύ","kit.menu.group.privacy":"Απόρρητο","kit.menu.group.shop":"Κατάστημα","kit.menu.accountHelp":"Το επίπεδο, τα επιτεύγματα και οι ρυθμίσεις σου, σε κάθε συσκευή.","kit.menu.about":"Σχετικά","kit.menu.aboutGame":"Σχετικά με το {name}","kit.menu.aboutPage":"Περισσότερα για το {name}","kit.menu.version":"Έκδοση {version}","kit.legal.rights":"Με επιφύλαξη παντός δικαιώματος","kit.legal.company":"Εταιρεία","kit.legal.privacy":"Απόρρητο","kit.legal.terms":"Όροι χρήσης"},eo={"kit.next":"Next","kit.done":"Done","kit.cancel":"Cancel","kit.close":"Close","kit.save":"Save","kit.on":"On","kit.off":"Off","kit.less":"Less","kit.more":"More","kit.paused":"Paused by the host","kit.reconnecting":"Reconnecting…","kit.players":"Players","kit.captions":"The narrator's words","kit.time.seconds":"{n} s","kit.time.minutes":"{n, plural, other {# min}}","kit.time.minutesSeconds":"{m, plural, other {# min}} {s} s","kit.timer.left":"{time} left","kit.timer.paused":"Paused, {time} left","kit.input.invalid":"That didn't count. Try again.","kit.input.step":"Too late: that part is over.","kit.input.late":"Too late: time's up.","kit.input.paused":"The host has paused the game.","kit.input.over":"The game is over.","kit.join.title":"Join the game","kit.join.codeLabel":"Room code","kit.join.codeHelp":"The six digits on the TV, or on the host's phone.","kit.join.year":"Year of birth","kit.join.yearFormat":"YYYY","kit.join.yearKept":"We keep only an age group, never the year.","kit.join.yearWrong":"Type the year with four digits.","kit.join.under":"These games are for ages 13 and up.","kit.join.room":"Room {code}","kit.join.changeCode":"Change","kit.join.vhubName":"Your VHub name","kit.join.nickname":"Your name in this room","kit.join.nicknameHelp":"2 to 16 letters or digits. Only this room sees it.","kit.join.avatar":"Your picture","kit.join.avatarN":"Picture {n}","kit.join.join":"Join","kit.join.joining":"Joining…","kit.join.watch":"Just watch","kit.join.code":"There's no room with this code. Check the TV and try again.","kit.join.gone":"This room has ended.","kit.join.locked":"This room is locked. Ask the host to open it.","kit.join.full":"This room is full.","kit.join.started":"The game has started, and this room doesn't take spectators.","kit.join.kicked":"The host removed you from this room.","kit.join.limited":"Too many wrong codes. Try again in a while.","kit.watching.started":"The game had already started, so you're watching. You'll play in the next one.","kit.watching.full":"The seats were full, so you're watching.","kit.display.full":"This room already has four screens.","kit.display.demoFull":"This demo already has two screens.","kit.display.key":"There's no room with this TV code. Check “Show on TV” on the host's phone and try again.","kit.pair.code":"No screen shows this code now. Check the code on the TV and try again.","kit.pair.tvCode":"That's a room's TV code. Type it on the TV, at vgraphics.gr/tv.","kit.limit.pairs":"This screen has asked for too many codes. Try again in a while.","kit.limit.codes":"Too many wrong codes from this device. Try again in an hour.","kit.net.failed":"That didn't work. Check your connection and try again.","kit.room.closed":"This room has closed.","kit.room.notNow":"Not right now.","kit.room.notMember":"You're not in this room any more.","kit.host.only":"Only the host can do that.","kit.host.tools":"Host","kit.host.pause":"Pause","kit.host.resume":"Resume","kit.host.paused":"Paused","kit.start.host":"To start, the host has to be one of the players.","kit.start.rules":"These rules can't start a game yet.","kit.name.short":"At least 2 letters.","kit.name.long":"At most 16 letters.","kit.name.chars":"Only letters, digits, spaces and . - _ '","kit.name.rude":"That name isn't allowed. Try another one.","kit.rules.title":"Rules","kit.rules.preset":"Ready-made rules","kit.rules.custom":"Custom","kit.rules.noLimit":"No time limit","kit.rules.auto":"Auto","kit.rules.balance":"Balance","kit.rules.saveMine":"Save as my rules","kit.rules.card":"Rules","kit.rules.changed":"changed","kit.rules.lang":"Room language","kit.rules.narrator":"Narrator","kit.rules.narrator.help":"Off: the captions and sounds stay, without the voice.","kit.rules.relaxed":"Relaxed timers","kit.rules.relaxed.help":"Every time limit is one and a half times as long.","kit.rules.tooFew":"{min, plural, one {At least # player is needed.} other {At least # players are needed.}}","kit.rules.tooMany":"{max, plural, one {At most # player can play.} other {At most # players can play.}}","kit.status.host":"Host","kit.status.out":"Out","kit.status.offline":"Offline","kit.status.ready":"Ready","kit.status.level":"Level","kit.progress.title":"Your progress","kit.progress.waiting":"Adding up your XP…","kit.progress.gained":"+{xp, number} XP","kit.progress.coins":"+{coins, number} coins","kit.progress.none":"No new XP this game","kit.progress.capped":"You've earned today's XP from this game. More tomorrow.","kit.progress.level":"Level {level}","kit.progress.levelUp":"Level up!","kit.progress.bar":"Level {level}: {into, number} of {needed, number} XP","kit.progress.toNext":"{n, number} XP to level {next}","kit.progress.unlocked":"{n, plural, one {New achievement} other {# new achievements}}","kit.progress.achievement":"New achievement","kit.progress.tier.bronze":"Bronze","kit.progress.tier.silver":"Silver","kit.progress.tier.gold":"Gold","kit.progress.keep":"Sign in to keep your XP","kit.progress.keepHelp":"You're playing as a guest, so your XP lives on this phone. Sign in with Google to keep it on every device.","kit.progress.earn":"Sign in to earn XP","kit.progress.earnHelp":"With a VHub account, every game gives you XP, levels and achievements.","kit.progress.signIn":"Sign in","ach.vhub.room-regular":"Room regular","ach.vhub.room-regular.about":"Play 10 room matches, in any game.","ach.vhub.champion":"Champion","ach.vhub.champion.about":"Win a room match in two different games.","ach.vhub.level-10":"Level 10","ach.vhub.level-10.about":"Reach VHub level 10.","ach.vhub.level-25":"Level 25","ach.vhub.level-25.about":"Reach VHub level 25.","ach.vhub.level-50":"Level 50","ach.vhub.level-50.about":"Reach VHub level 50.","ach.vhub.level-100":"Level 100","ach.vhub.level-100.about":"Reach VHub level 100.","kit.tv.qr":"QR code to join the room","kit.tv.joinHelp":"Point your phone's camera at the code, or open the page and type the six digits.","kit.tv.sound":"Press OK for sound","kit.tv.leave":"Take this TV out of the room?","kit.tv.stay":"Stay","kit.tv.leaveYes":"Leave","kit.tv.title":"Show on TV","kit.tv.step1":"On the TV, open the web browser and go to {site}.","kit.tv.step2":"Type the TV code {code} with the remote.","kit.tv.link":"Or open this link on the screen, on a laptop say:","kit.tv.copied":"Link copied. Open it in the screen's web browser.","kit.tv.noMirror":"Don't mirror your phone's screen to the TV: everyone would see your secrets.","kit.tv.tableMode":"No TV? Use this phone as the table","kit.tv.joinAt":"Join at","kit.tv.roomCode":"Room code","kit.tv.howTo":"How to play","kit.tv.freeSeat":"Free seat","kit.tv.faceDown":"The card stays face down","kit.tv.awards":"Awards","kit.tvCode.label":"TV code","kit.tvCode.keypad":"Number keys","kit.tvCode.delete":"Delete","kit.tvCode.ok":"OK","kit.tvCode.pairing":"That's the code this screen shows for a demo. Type it on your phone, in the demo.","kit.tvPair.qr":"QR code that opens the demo on your phone","kit.tvPair.code":"Demo code","kit.tvPair.help":"Scan the QR with your phone's camera, or type the code in the demo.","kit.tvHelp.type":"On the TV, open {site} in its web browser and type this TV code with the remote:","kit.tvHelp.or":"or type it at {site}","kit.tvHelp.link":"Or open this link on the TV or a computer:","kit.tvHelp.share":"Share the link","kit.tvHelp.copied":"Link copied","kit.tvHelp.again":"TV closed? Open the same link or type the same code again: it comes back into this room.","kit.tvHelp.join":"others join at {site}","kit.tvHelp.showing":"TV showing a code? Type it here:","kit.tvHelp.connect":"Connect","kit.tvHelp.paired":"Your TV is coming in.","kit.lobby.needMore":"{n, plural, one {Waiting for # more player} other {Waiting for # more players}}","kit.lobby.waitingHost":"Waiting for {name} to start","kit.lobby.seats":"{n} of {min} players","kit.lobby.watchingCount":"{n, plural, other {# watching}}","kit.lobby.copied":"Link copied. Paste it in a message.","kit.lobby.inviteLink":"Send this link: {link}","kit.lobby.rename":"Change name","kit.lobby.ready":"Ready","kit.lobby.getReady":"I'm ready","kit.lobby.play":"I want to play","kit.lobby.watching":"You're watching this game.","kit.lobby.start":"Start","kit.lobby.rules":"Rules","kit.lobby.invite":"Invite","kit.lobby.tv":"Show on TV","kit.lobby.lock":"Lock room","kit.lobby.locked":"Room locked","kit.lobby.kickTitle":"Remove from the room?","kit.lobby.kick":"Remove","kit.invite.title":"Come and play","kit.invite.text":"Join my room: code {code}","kit.invite.send":"Send your friends this link","kit.invite.copy":"Copy the link","kit.invite.scan":"Or they scan this code with their phone's camera.","kit.consent.title":"Privacy choice","kit.consent.text":"May we count how the game is played (with Google Analytics), to fix problems and make it better?","kit.consent.privacy":"Privacy policy","kit.consent.deny":"Don't allow","kit.consent.allow":"Allow","kit.ads.label":"Advertisement","kit.ads.test":"Test ad","kit.ads.tvPlaying":"The TV is showing a short ad. You can start when it ends.","kit.ads.off":"This room shows no ads.","kit.pass.thanks":"No ads tonight, thanks to {name}'s Host Pass","kit.pass.nudgeTitle":"Skip these for good","kit.pass.nudgeBody":"Host Pass · {price} once","kit.pass.nudgeLines":`No banners on any phone in your rooms
No video between games on the TV
Pay once, for every room you host`,"kit.pass.see":"See the pass","kit.pass.notNow":"Not now","kit.store.title":"Store","kit.store.balance":"Your coins: {coins, number}","kit.store.tabs":"Store sections","kit.store.sets":"Sets","kit.store.looks":"Looks","kit.store.pass":"Host Pass","kit.store.empty":"New looks are on their way.","kit.store.worth":"Worth {coins, number} coins one by one","kit.store.coinPrice":"{coins, number} coins","kit.store.inPacks":"{euro} in coin packs","kit.store.buy":"Buy","kit.store.yours":"Yours","kit.store.equip":"Equip","kit.store.unequip":"Unequip","kit.store.short":"Short by {n, number} coins","kit.store.partOwned":"You already have some of these. Get the rest one by one.","kit.store.askHost":"Ask whoever runs the evening","kit.store.signIn":"Sign in to buy","kit.store.signInHelp":"Looks belong to your VHub account, so they follow you to every device.","kit.store.holds":"Everything in it","kit.store.slot.portrait":"Portrait","kit.store.slot.seal":"Wax seal","kit.store.slot.cardBack":"Card back","kit.store.slot.plate":"Name plate","kit.hold.see":"Hold to see","kit.hold.screenReader":"Your screen reader reads the card aloud: use headphones.","kit.secret.title":"Secret actions","kit.secret.none":"No secret actions right now.","kit.secret.hold":"Hold to open. Every phone has this.","kit.phone.keepOn":"Keep your screen on during the game, or your phone may drop out.","kit.phone.views":"Views","kit.phone.you":"You","kit.phone.table":"Table","kit.phone.room":"Room","kit.phone.menu":"Menu","kit.account.signIn":"Sign in to VHub","kit.account.yours":"Your VHub account","kit.account.yoursLevel":"Your VHub account, level {level}","kit.friend.add":"Add friend","kit.friend.sent":"Requested","kit.friend.cancel":"Cancel","kit.friend.accept":"Accept","kit.friend.friends":"Friends","kit.friend.signIn":"Sign in to add friends","kit.friend.saidSent":"Request sent. You're friends once they accept.","kit.friend.saidExists":"You've already asked. They'll see your request.","kit.friend.saidFriends":"You're friends now.","kit.friend.saidMutual":"You're friends now: they had asked you too.","kit.friend.saidLimit":"That's the most friend requests for today. Try again tomorrow.","kit.friend.saidPending":"50 of your requests are waiting for an answer. Cancel some, or wait until they answer.","kit.friend.saidFull":"One of you already has the most friends VHub allows.","kit.friend.saidCant":"You can't add this player.","kit.friend.saidGone":"That player isn't there any more.","kit.friend.saidAge":"Friends are for older players.","kit.friend.saidError":"That didn't work. Check your connection and try again.","kit.friend.cancelled":"Request to {name} cancelled","kit.friend.cancelledAnon":"Request cancelled","kit.friend.notCancelled":"Couldn't cancel the request to {name}","kit.friend.notCancelledAnon":"Couldn't cancel the request","kit.toast.undo":"Undo","kit.connection.online":"Connected","kit.connection.reconnecting":"Reconnecting","kit.connection.offline":"Offline","kit.help.row":"Help & ideas","kit.help.rowHelp":"Something wrong, a bug or an idea? Tell us and follow our answers","kit.help.answered":"VGraphics answered you","kit.help.group":"Help","kit.help.lede":"Something wrong, a bug, a purchase that went wrong, or an idea? Tell us here and follow our answers. We read every ticket.","kit.help.new":"Open a ticket","kit.help.yours":"Your tickets","kit.help.newAnswers":"{n, plural, one {# new answer} other {# new answers}}","kit.help.count":"{n, plural, one {# ticket} other {# tickets}}","kit.help.loading":"Loading your tickets…","kit.help.loadFailed":"Your tickets didn't load. Check your connection and try again.","kit.help.retry":"Try again","kit.help.empty":"No tickets yet","kit.help.emptyHere":"No tickets in this browser yet","kit.help.emptyLine":"When you open one, it shows here with our answers.","kit.help.signedInLine":"Signed in, your tickets follow you on every device.","kit.help.signedOut":"Sign in and your tickets follow you to every device and every VGraphics game and app. Without an account, this browser keeps them.","kit.help.signedOutList":"These are the tickets this browser keeps. Sign in to see them on every device.","kit.help.newAnswer":"New answer","kit.help.statusSr":"Status:","kit.help.status.open":"Open","kit.help.status.answered":"Answered","kit.help.status.closed":"Closed","kit.help.status.fixed":"Fixed","kit.help.status.done":"Done","kit.help.status.planned":"Planned","kit.help.status.wont":"Won't do","kit.help.status.duplicate":"Duplicate","kit.help.status.noReply":"No reply","kit.help.status.in":"{status} in {version}","kit.help.kind.problem":"Something's wrong","kit.help.kind.problemHelp":"It doesn't work the way it should.","kit.help.kind.bug":"A bug","kit.help.kind.bugHelp":"Something broke, froze or looks wrong.","kit.help.kind.idea":"An idea","kit.help.kind.ideaHelp":"Something you'd like us to add or change.","kit.help.kind.purchase":"A purchase","kit.help.kind.purchaseHelp":"Coins, a pass or a restore that went wrong.","kit.help.kind.other":"Something else","kit.help.kind.otherHelp":"Anything else you want to tell us.","kit.help.about":"What is it about?","kit.help.whatHappened":"What happened?","kit.help.whatIdea":"What would you like?","kit.help.invalid":"Tell us a little more: at least 10 characters, and an email address that works (or none).","kit.help.emailMe":"Email me the answers","kit.help.emailMeHelp":"To the address you signed in with. You can always follow it here too.","kit.help.email":"Your email (optional)","kit.help.emailHelp":"We send the answers there. Without one, you can follow this ticket only in this browser.","kit.help.trap":"Website","kit.help.sentWith":"Sent with it: {device}","kit.help.send":"Send","kit.help.sending":"Sending…","kit.help.sendFailed":"It didn't send. Check your connection and try again.","kit.help.limit":"That's the most tickets for now. Try again in an hour, or email support@vgraphics.gr.","kit.help.blocked":"We can't take tickets from here. Email support@vgraphics.gr.","kit.help.sent":"Thanks, your ticket is open","kit.help.sentLine":"We'll answer here, in the game, and by email if you gave us one.","kit.help.openIt":"Open your ticket","kit.help.another":"Open another ticket","kit.help.back":"Back","kit.help.vgraphics":"VGraphics","kit.help.you":"You","kit.help.meta":"{id} · opened {when}","kit.help.threadLoading":"Loading the ticket…","kit.help.threadFailed":"The ticket didn't load. Check your connection and try again.","kit.help.reply":"Your reply","kit.help.replyReopens":"Something more? A reply opens it again.","kit.help.replyLimit":"That's the most replies for now. Try again in an hour.","kit.help.replyClosed":"This ticket is closed. Open a new one.","kit.help.replyFailed":"That didn't send.","kit.help.closedNoReply":"This ticket is closed. Something new?","kit.help.openNew":"Open a new ticket","kit.help.closeTicket":"Close the ticket","kit.help.closedNote":"Closed. A reply within 30 days opens it again.","kit.help.closeFailed":"It didn't close. Check your connection and try again.","kit.help.notFound":"We can't find this ticket","kit.help.notFoundLine":"Open it from the link in our email, or sign in with the account that opened it.","kit.help.offer.title":"Need help or have an idea?","kit.help.offer.body":"Found a problem, a bug, or something you'd love us to add? Tell us. We read every ticket.","kit.help.offer.later":"Not now","kit.news.title":"Newsletter","kit.news.lede":"News about {name}. One email a month at most, and you can leave in one tap.","kit.news.email":"Email","kit.news.emailOr":"Email (leave empty for {email})","kit.news.vgraphics":"New VGraphics games and apps too","kit.news.consent":"For people aged 16 and over. One email a month at most. Unsubscribe in one tap.","kit.news.signUp":"Sign me up","kit.news.signingUp":"Signing up…","kit.news.pending":"Check your inbox","kit.news.pendingLine":"We sent a link to {email}. Tap it to finish signing up.","kit.news.change":"Change address","kit.news.signed":"You're signed up","kit.news.signedLine":"News comes to {email}. One email a month at most.","kit.news.signedInLine":"News comes to the address you signed in with. One email a month at most.","kit.news.manage":"Manage topics","kit.news.under16":"The newsletter is for people aged 16 and over.","kit.news.invalid":"That doesn't look like an email address. Check it and try again.","kit.news.noEmail":"Type the email address the news should go to.","kit.news.age":"This news is for people aged 16 and over.","kit.news.noTopic":"Choose at least one topic.","kit.news.limit":"Lots of sign-ups came from here in the last hour. Try again in an hour.","kit.news.failed":"It didn't go through. Check your connection and try again.","kit.menu.title":"Settings","kit.menu.gamePicture":"Use my character's picture instead","kit.menu.roomHelp":"Others join with this code.","kit.menu.language":"Language","kit.menu.music":"Music","kit.menu.sounds":"Sound effects","kit.menu.voice":"Narrator voice","kit.menu.vibration":"Vibration","kit.menu.musicLevel":"Music volume","kit.menu.soundsLevel":"Sound effects volume","kit.menu.voiceLevel":"Narrator volume","kit.menu.soundHelp":"For the phone that plays the room's sound, when there's no TV.","kit.menu.textSize":"Text size","kit.menu.captions":"The narrator's words on my phone","kit.menu.calm":"Less motion","kit.menu.analytics":"Help make the game better (Google Analytics)","kit.menu.adChoices":"Ad choices","kit.menu.leaveSure":"Leave the room? You can come back with the code.","kit.menu.leave":"Leave the room","kit.menu.group.room":"In this room","kit.menu.group.sound":"Sound","kit.menu.group.reading":"Reading","kit.menu.group.you":"You","kit.menu.group.privacy":"Privacy","kit.menu.group.shop":"Shop","kit.menu.accountHelp":"Your level, achievements and settings, on every device.","kit.menu.about":"About","kit.menu.aboutGame":"About {name}","kit.menu.aboutPage":"More about {name}","kit.menu.version":"Version {version}","kit.legal.rights":"All rights reserved","kit.legal.company":"Company","kit.legal.privacy":"Privacy","kit.legal.terms":"Terms"};class to extends Error{constructor(){super(...arguments);ae(this,"name","MessageSyntaxError")}}const mt=/[A-Za-z0-9_]/,io=/[A-Za-z0-9_=-]/;class oo{constructor(e){ae(this,"text");ae(this,"i",0);this.text=e}parse(){const e=this.message(!1);if(this.i<this.text.length)throw this.error('a "}" with no "{"');return e}message(e){const i=[];let o="";for(;this.i<this.text.length;){const n=this.text[this.i];if(n==="}")break;n==="'"?o+=this.apostrophe(e):n==="{"||n==="#"&&e?(o&&i.push(o),o="",n==="#"?(i.push({kind:"pound"}),this.i++):i.push(this.argument())):(o+=n,this.i++)}return o&&i.push(o),i}apostrophe(e){const i=this.text[this.i+1];if(i==="'")return this.i+=2,"'";if(this.i++,i!=="{"&&i!=="}"&&!(e&&i==="#"))return"'";let o="";for(;this.i<this.text.length;){const n=this.text[this.i];if(n==="'"&&this.text[this.i+1]==="'")o+="'",this.i+=2;else{if(n==="'")return this.i++,o;o+=n,this.i++}}return o}argument(){this.i++,this.space();const e=this.word(mt);if(!e)throw this.error("an argument with no name");if(this.space(),this.text[this.i]==="}")return this.i++,{kind:"arg",name:e};this.expect(","),this.space();const i=this.word(mt);if(this.space(),i==="number")return this.expect("}"),{kind:"number",name:e};if(i!=="plural"&&i!=="select")throw this.error(`an unknown type "${i}" in {${e}}`);this.expect(","),this.space();const o=new Map;for(;this.text[this.i]!=="}";){if(this.i>=this.text.length)throw this.error(`{${e}, ${i}} isn't closed`);const n=this.word(io);if(!n)throw this.error(`a case name in {${e}, ${i}}`);if(n.startsWith("=")&&(i==="select"||!/^=\d+$/.test(n)))throw this.error(`the case "${n}" in {${e}, ${i}}`);if(o.has(n))throw this.error(`the case "${n}" twice in {${e}, ${i}}`);this.space(),this.expect("{"),o.set(n,this.message(i==="plural")),this.expect("}"),this.space()}if(this.i++,!o.has("other"))throw this.error(`{${e}, ${i}} has no "other" case`);return{kind:i,name:e,cases:o}}word(e){const i=this.i;for(;this.i<this.text.length&&e.test(this.text[this.i]);)this.i++;return this.text.slice(i,this.i)}space(){for(;this.i<this.text.length&&/\s/.test(this.text[this.i]);)this.i++}expect(e){if(this.text[this.i]!==e)throw this.error(`"${e}"`);this.i++}error(e){return new to(`expected ${e} at ${this.i} in "${this.text}"`)}}const ft=new Map;function no(t){let e=ft.get(t);return e||(e=new oo(t).parse(),ft.set(t,e)),e}const vt=new Map,bt=new Map;function xt(t){let e=vt.get(t);return e||(e=new Intl.NumberFormat(t),vt.set(t,e)),e}function ro(t){let e=bt.get(t);return e||(e=new Intl.PluralRules(t),bt.set(t,e)),e}function wt(t,e,i){let o;try{o=no(t)}catch{return t}return Ie(o,e??{},i,null)}function Ie(t,e,i,o){let n="";for(const r of t){if(typeof r=="string"){n+=r;continue}if(r.kind==="pound"){n+=o===null?"#":xt(i).format(o);continue}const a=Object.prototype.hasOwnProperty.call(e,r.name)?e[r.name]:void 0;switch(r.kind){case"arg":n+=a===void 0?`{${r.name}}`:String(a);break;case"number":n+=a===void 0?`{${r.name}}`:typeof a=="number"?xt(i).format(a):a;break;case"plural":{const l=typeof a=="number"?a:Number(a),c=`=${l}`,p=r.cases.has(c)?c:Number.isFinite(l)?ro(i).select(l):"other",d=r.cases.get(p)??r.cases.get("other")??[];n+=Ie(d,e,i,Number.isFinite(l)?l:null);break}case"select":{const l=r.cases.get(String(a))??r.cases.get("other")??[];n+=Ie(l,e,i,o);break}}}return n}const _e={el:{...Ji},en:{...eo}};function ao(t){for(const e of Zi)Object.assign(_e[e],t[e]??{})}function yt(t,e){return Object.prototype.hasOwnProperty.call(_e[t],e)}const _t=new Set;function ri(t,e,i){if(yt(t,e))return wt(_e[t][e],i,t);_t.has(`${t}:${e}`)||(_t.add(`${t}:${e}`),console.warn(`party-kit i18n: no "${e}" in ${t}`));const o=t==="el"?"en":"el";return yt(o,e)?wt(_e[o][e],i,o):e}function so(t){for(const e of t){const i=e.toLowerCase().split("-")[0];if(i==="el"||i==="en")return i}return t.length>0?"en":"el"}function po(){return typeof navigator>"u"?[]:navigator.languages&&navigator.languages.length>0?navigator.languages:navigator.language?[navigator.language]:[]}function ai(t){return t??so(po())}const q=Q(ai(O.language.get()));O.language.watch(t=>{q.value=ai(t)});function lo(t){q.value=t,O.language.set(t)}const co={el:"Ελληνικά",en:"English"},si=Ti(null);function tt(){return Mi(si)??q.value}function it(){const t=tt();return(e,i)=>ri(t,e,i)}const ko='input, textarea, [contenteditable]:not([contenteditable="false"])';function Tt(t){const e=t==null?void 0:t.closest;return typeof e=="function"&&e.call(t,ko)!==null}function ho(t){return t.key==="F12"||t.ctrlKey&&!t.altKey&&!t.metaKey&&(t.shiftKey?/^Key[IJC]$/:/^KeyU$/).test(t.code)||t.metaKey&&t.altKey&&!t.ctrlKey&&/^Key[IJCU]$/.test(t.code)}const St=new WeakSet;function uo(t=typeof document>"u"?void 0:document){!t||St.has(t)||(St.add(t),t.addEventListener("contextmenu",e=>{Tt(e.target)||e.preventDefault()}),t.addEventListener("dragstart",e=>{var i;((i=e.target)==null?void 0:i.tagName)==="IMG"&&e.preventDefault()}),t.addEventListener("keydown",e=>{ho(e)&&!Tt(e.target)&&e.preventDefault()},!0))}const zt={en:["Stop!",`This site, with its art, music and code, belongs to VGraphics. Copying any of it is not allowed.
Terms of use: https://vgraphics.gr/terms/`],el:["Σταματήστε!",`Αυτός ο ιστότοπος, με την τέχνη, τη μουσική και τον κώδικά του, ανήκει στη VGraphics. Δεν επιτρέπεται η αντιγραφή κανενός μέρους του.
Όροι χρήσης: https://vgraphics.gr/terms/`]},Mt=Symbol.for("vgraphics.console-warning");function go(t,e=console.log){if(typeof window>"u")return;const i=globalThis;if(i[Mt])return;i[Mt]=!0;const[o,n]=zt[t]??zt.en;e(`%c${o}%c
${n}`,"color:#E5322D;font-size:52px;font-weight:bold;-webkit-text-stroke:1px #000","font-size:16px;line-height:1.5")}const A={easing:"cubic-bezier(.2, .8, .2, 1)",open:260,close:200,fadeIn:150,fadeOut:100};function mo(t){const e=et.value;return{duration:t?e?A.fadeIn:A.open:e?A.fadeOut:A.close,easing:A.easing}}function fo(t){return typeof t.animate=="function"&&!document.hidden}function vo(t,e){let i=t.length;const o=()=>{i-=1,i===0&&e()};for(const n of t){const r=n.finished;r?r.then(o,()=>{}):n.onfinish=o}}const te=new Map;function bo(t,e,i){return t.style.transformOrigin="50% 50%","translateY(12px) scale(0.98)"}function he(t){if(t){for(const e of te.get(t)??[])e.cancel();te.delete(t)}}function jt(t,e,i,o,n,r){if(!fo(t)){he(t),n==null||n();return}const l=te.has(t)?getComputedStyle(t):null,c=l&&{opacity:+l.opacity,transform:l.transform};he(t);const p=getComputedStyle(t).transform,d=p&&p!=="none"?p:"",u=bo(t),s={opacity:0,transform:d?`${d} ${u}`:u},k={opacity:1,transform:d||"none"},v=o?[c??s,k]:[c??k,s],T={...mo(o),fill:"forwards"},b=[t.animate(et.value?v.map(x=>({opacity:x.opacity})):v,T)];te.set(t,b),vo(b,()=>{te.get(t)===b&&(o&&he(t),n==null||n())})}const xo=`
/* Help & ideas: the row in a game's Settings, with the dot for answers not yet opened. */
.pk-help-row { justify-content: flex-start; gap: 0.75em; text-align: left; font-size: 1em; }
.pk-help-row .pk-icon { color: var(--pk-accent); }
.pk-help-row-words { display: grid; gap: 0.15em; flex: 1 1 auto; min-width: 0; }
.pk-help-row-title { font-size: 1.1em; font-weight: 700; }
.pk-help-row-line { color: var(--pk-text-dim); font-size: 0.9em; font-weight: 400; }
.pk-help-dot-wrap { display: inline-flex; flex: none; }
.pk-help-dot {
  display: inline-block; flex: none; width: 10px; height: 10px; border-radius: 50%; background: var(--pk-accent);
  box-shadow: 0 0 0 3px rgba(var(--pk-accent-rgb), 0.28);
}

/* The desk: one view at a time, each fading in as it replaces the last. */
.pk-desk-pane { display: grid; gap: 0.75em; outline: none; animation: pk-fade ${A.open}ms ${A.easing} both; }
.pk-desk-view { display: grid; gap: 0.75em; }
.pk-desk-head { margin: 0.4em 0 0; font-size: 1.05em; font-weight: 700; }
.pk-desk-back { display: inline-flex; align-items: center; gap: 0.35em; justify-self: start; }
/* A plain arrow, not a chevron: the kit's chevrons belong to what opens (motion guard). */
.pk-desk-back::before { content: "\\2190"; text-decoration: none; }
.pk-desk-empty { display: grid; gap: 0.3em; padding: 1em; border: 1px dashed var(--pk-rule); border-radius: 14px; text-align: center; }
.pk-desk-empty-title { font-weight: 700; }
.pk-desk-invite { display: grid; gap: 0.6em; padding: 0.8em; border-radius: 14px; background: rgba(var(--pk-text-rgb), 0.05); }
.pk-desk-invite .pk-btn { justify-self: start; }

/* The tickets, in their own box (3.5 rows, faded edges: FadeList). */
.pk-desk-list { list-style: none; display: grid; gap: 0.5em; }
.pk-desk-row {
  display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 0.35em 0.75em; width: 100%;
  min-height: 64px; padding: 0.7em 0.9em; border: 1px solid var(--pk-rule); border-radius: 14px; background: var(--pk-card);
  color: var(--pk-text); text-align: left; cursor: var(--cursor-link, pointer);
}
.pk-desk-row-new { border-color: var(--pk-accent); }
.pk-desk-row-first { overflow: hidden; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }
.pk-desk-row-meta { grid-column: 1 / -1; display: flex; flex-wrap: wrap; align-items: center; gap: 0.3em 0.75em; color: var(--pk-text-dim); font-size: 0.82em; }
.pk-desk-new { display: inline-flex; align-items: center; gap: 0.4em; color: var(--pk-accent); font-weight: 700; }
.pk-desk-new .pk-help-dot { width: 8px; height: 8px; }
.pk-desk-kind-tag {
  display: inline-block; padding: 0.05em 0.55em; border: 1px solid var(--pk-rule); border-radius: 999px;
  color: var(--pk-text-dim); font-size: 0.82rem; font-weight: 600; white-space: nowrap;
}

/* A ticket's status (design canon 5). */
.pk-ticket-badge {
  --pk-tone: var(--pk-text-dim);
  display: inline-flex; align-items: center; gap: 6px; height: 24px; padding: 0 10px; border-radius: 12px;
  border: 1px solid var(--pk-tone); color: var(--pk-tone); font-size: 0.8rem; font-weight: 700; line-height: 1; white-space: nowrap;
}
.pk-ticket-badge::before { content: ""; width: 6px; height: 6px; flex: none; border-radius: 50%; background: var(--pk-tone); }
.pk-ticket-badge-sun { --pk-tone: #F4C430; }
.pk-ticket-badge-violet { --pk-tone: #8182E2; }
.pk-ticket-badge-sky { --pk-tone: #74A2FF; }
.pk-ticket-badge-ink { --pk-tone: var(--pk-text-dim); }
.pk-ticket-badge-sun::before, .pk-ticket-badge-violet::before { box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.16); }

/* Opening a ticket: what it's about as option cards, the words, where the answers go. */
.pk-desk-kinds { display: grid; grid-template-columns: repeat(auto-fit, minmax(13em, 1fr)); gap: 0.5em; margin: 0; padding: 0; border: 0; }
.pk-desk-kinds legend { margin-bottom: 0.5em; padding: 0; }
.pk-desk-kind {
  position: relative; display: grid; gap: 0.15em; min-height: 56px; padding: 0.6em 0.8em; border: 2px solid var(--pk-rule);
  border-radius: 14px; cursor: var(--cursor-link, pointer);
}
.pk-desk-kind-on { border-color: var(--pk-accent); background: var(--pk-accent-soft); }
.pk-desk-kind:focus-within { outline: 3px solid var(--pk-accent); outline-offset: 2px; }
.pk-desk-kind-name { font-weight: 700; }
.pk-desk-kind-on .pk-desk-kind-name::before { content: "\\2713"; margin-right: 0.4em; color: var(--pk-accent); }
.pk-desk-kind-line { color: var(--pk-text-dim); font-size: 0.85em; }
.pk-root .pk-desk-text { min-height: 7em; resize: vertical; font: inherit; font-size: 1.05em; line-height: 1.45; }
.pk-desk-count { justify-self: end; font-variant-numeric: tabular-nums; }
.pk-desk-switch { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 0.2em 1em; }
.pk-desk-switch .pk-help { grid-column: 1 / -1; }
.pk-desk-device { font-size: 0.82em; overflow-wrap: anywhere; }
/* The field a bot fills: off the screen, out of the tab order and away from screen readers. */
.pk-trap { position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden; }
.pk-desk-sent { justify-items: center; padding: 0.5em 0; text-align: center; }
.pk-desk-sent-mark { width: 2.4em; height: 2.4em; color: var(--pk-accent); }
.pk-desk-sent-title { margin: 0; font-size: 1.15em; }
.pk-desk-sent-actions { justify-content: center; width: 100%; }

/* A ticket's thread (design canon 6). */
.pk-desk-thread-head { display: grid; gap: 0.4em; }
.pk-desk-thread-title {
  margin: 0; overflow: hidden; font-size: 1.15em; font-weight: 700; line-height: 1.3; text-overflow: ellipsis; white-space: nowrap;
}
.pk-desk-thread-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 0.4em 0.75em; color: var(--pk-text-dim); font-size: 0.85em; }
.pk-msgs { list-style: none; display: grid; gap: 14px; }
.pk-msg { display: flex; align-items: flex-end; gap: 8px; }
.pk-msg-own { justify-content: flex-end; }
.pk-msg-bubble { max-width: min(640px, 88%); padding: 12px 16px 14px; }
.pk-msg-own .pk-msg-bubble { border-radius: 18px 18px 6px 18px; background: rgba(var(--pk-accent-rgb), 0.16); }
.pk-msg-theirs .pk-msg-bubble { border: 1px solid var(--pk-rule); border-radius: 18px 18px 18px 6px; background: var(--pk-card); }
.pk-msg-face {
  display: inline-flex; align-items: center; justify-content: center; flex: none; width: 32px; height: 32px; border-radius: 50%;
  background: var(--pk-accent); color: var(--pk-on-accent); font-weight: 800;
}
.pk-msg-who { margin-bottom: 0.3em; color: var(--pk-text-dim); font-size: 0.8rem; }
.pk-msg-text { white-space: pre-wrap; overflow-wrap: anywhere; -webkit-user-select: text; user-select: text; }
.pk-msg-line { display: flex; align-items: center; gap: 0.75em; }
.pk-msg-line::before, .pk-msg-line::after { content: ""; flex: 1 1 auto; height: 1px; background: var(--pk-rule); }
.pk-msg-system { flex: none; max-width: 80%; color: var(--pk-text-dim); font-size: 0.82rem; text-align: center; }
.pk-desk-reply { display: grid; gap: 0.6em; }
.pk-desk-closed { display: grid; gap: 0.6em; padding: 0.8em; border-radius: 14px; background: rgba(var(--pk-text-rgb), 0.05); }
@media (max-width: 599px) {
  .pk-desk-thread-title { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; white-space: normal; }
}

/* The help offer at a game's end screen. */
.pk-offer-body { font-size: 1em; }

/* The newsletter row. */
.pk-news { display: grid; gap: 0.6em; }
.pk-news-title { margin: 0; font-size: 1.05em; font-weight: 700; }
.pk-news-form { display: grid; gap: 0.75em; }
.pk-news-state { font-weight: 700; }
.pk-news-switch { display: flex; align-items: center; justify-content: space-between; gap: 1em; }
.pk-news-consent { font-size: 0.85em; }
.pk-news .pk-link { justify-self: start; }
`,Lt=`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 56 56' fill='none' stroke='%23000' stroke-width='1.6' stroke-linecap='round'%3E%3Cpath d='M2 54V2h52'/%3E%3Cpath d='M9 54V9h45'/%3E%3Cpath d='M9 25a16 16 0 0 1 16-16M9 37a28 28 0 0 1 28-28'/%3E%3Cpath d='M9 9l13 13M9 17l7 7M17 9l7 7'/%3E%3C/svg%3E")`,wo=`
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
/* Held back (off-button.ts, design-canon.md 14): aria-disabled, still in the focus order, its ring drawn as any button's. */
.pk-btn:disabled, .pk-btn[aria-disabled="true"] { opacity: 0.45; cursor: var(--cursor, default); }
/* The colours under .pk-root, or the reset's ".pk-root button { color: inherit }" wins over one class. */
.pk-root .pk-btn-primary { background: var(--pk-accent); border-color: var(--pk-accent); color: var(--pk-on-accent); }
.pk-root .pk-btn-on { border-color: var(--pk-good); color: var(--pk-good); }
.pk-root .pk-btn-danger { border-color: var(--pk-danger); color: var(--pk-danger); }
/* A link drawn as a button is a button (George's doors review, 29 Oct 2026: /join's "Show the game on this screen" was an
   underlined gold link in an outline, and the games' cream-on-gold link buttons): the link colour and underline don't
   reach it. */
.pk-root a.pk-btn { color: var(--pk-text); text-decoration: none; }
.pk-root a.pk-btn-primary { color: var(--pk-on-accent); }
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
/* − value +: its buttons are 30 px boxes, as the approved Settings draws them (29 Oct 2026) and the Unity app does, each
   on a 44 px hit area for a thumb; the box is the button's ::before, so the gap beside it is the hit area's margin. */
.pk-stepper { display: inline-flex; align-items: center; gap: 0.1em; }
.pk-step {
  position: relative; display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; padding: 0;
  border: 0; background: none; cursor: var(--cursor-link, pointer);
}
.pk-step::before {
  content: ""; position: absolute; top: 7px; left: 7px; width: 30px; height: 30px; box-sizing: border-box;
  border: 1px solid var(--pk-rule); border-radius: 8px; pointer-events: none;
}
/* The box doesn't grow with the text size, so neither does its − or +. */
.pk-step .pk-icon { width: 18px; height: 18px; }
.pk-step:disabled, .pk-step[aria-disabled="true"] { opacity: 0.4; cursor: var(--cursor, default); }
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
/* They move with the kit's one motion piece (sheet.tsx, motion.ts; design-canon.md 2), never with CSS animations: the
   sheet rises as it and the backdrop fade in (260 ms), and goes back the same way, a little faster (200 ms). */
.pk-sheet-backdrop {
  position: fixed; top: 0; right: 0; bottom: 0; left: 0; z-index: 20; display: flex; align-items: flex-end; background: rgba(0, 0, 0, 0.6);
}
/* The look of the Settings sheet George approved (29 Oct 2026): a 1 px line in the accent along the top, rounder corners,
   and a grab handle in the rule's colour above the head. */
.pk-sheet {
  display: grid; gap: 0.75em; width: 100%; max-height: 88%; overflow: auto; padding: 0.6em 1.1em 1.5em;
  padding-bottom: calc(1.5em + env(safe-area-inset-bottom, 0px)); border-top: 1px solid var(--pk-accent);
  border-radius: 22px 22px 0 0; background: var(--pk-panel);
}
.pk-sheet-grab { justify-self: center; width: 44px; height: 4px; border-radius: 2px; background: var(--pk-rule); }
.pk-sheet-head { display: flex; align-items: center; justify-content: space-between; gap: 1em; }
/* Show on TV (phone/tv-help.tsx): the TV code to read off, its link and Share, the room code, both ways in, and how a TV
   that closed comes back. */
.pk-tv-help-code { color: var(--pk-accent); font-family: var(--pk-font-digits); font-size: 1.9em; font-weight: 700; letter-spacing: 0.04em; white-space: nowrap; }
/* The TV's link as code text, as the doors write codes, never an input box (George's doors review, 29 Oct 2026). */
.pk-tv-help-link {
  display: block; padding: 0.6em 0.8em; border-radius: 12px; background: rgba(var(--pk-text-rgb), 0.06); color: var(--pk-text);
  font-family: var(--pk-font-digits); font-size: 1em; line-height: 1.35; letter-spacing: 0.02em; overflow-wrap: anywhere;
}
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
/* Each button on one line (the menu rule; George's doors review, 29 Oct 2026: the Greek Watch wrapped): each as wide as
   its words, the room left shared between them. */
.pk-join-bar > .pk-btn { flex: 1 1 auto; min-width: 0; white-space: nowrap; }
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
/* A refused code, and one on its way (CodeBoxes' invalid and busy). */
.pk-code-boxes-wrong .pk-code-box-on { border-color: var(--pk-danger); color: var(--pk-danger); }
.pk-code-boxes-going .pk-code-box-on { border-color: var(--pk-accent); color: var(--pk-accent); }
/* The doors' layout B on a phone (CodeBoxes' look "board"): the six boxes as split-flap tiles on a dark board, the way
   the TV shows its code, in the game's tokens. */
.pk-code-boxes-board { padding: 0.75em; border: 2px solid rgba(var(--pk-text-rgb), 0.08); border-radius: 18px; background: rgba(var(--pk-ground-rgb), 0.72); }
.pk-code-boxes-board .pk-code-box {
  height: 2.5em; border: 0; border-radius: 8px; font-size: 1.8em;
  background: linear-gradient(var(--pk-card) 0 49.3%, var(--pk-ground) 49.3% 50.7%, var(--pk-panel) 50.7%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 3px 0 rgba(0, 0, 0, 0.45);
}
.pk-code-boxes-board .pk-code-box:empty::before { content: ""; width: 0.5em; height: 0.08em; border-radius: 2px; background: rgba(var(--pk-text-rgb), 0.22); }
.pk-code-typing.pk-code-boxes-board .pk-code-box-next { box-shadow: 0 0 0 3px var(--pk-accent), 0 0 14px rgba(var(--pk-accent-rgb), 0.35); }
/* Refused: red digits in a red ring, as on the TV's board (pk-tv-code-board.pk-tv-code-wrong). */
.pk-code-boxes-board.pk-code-boxes-wrong .pk-code-box-on { box-shadow: 0 0 0 3px var(--pk-danger), 0 3px 0 rgba(0, 0, 0, 0.45); }
.pk-join-room { color: var(--pk-text-dim); }
.pk-join-vhub { display: flex; align-items: center; gap: 1.9em; }
/* An automatic VHub name: the nickname field beside their picture takes the rest of the row. */
.pk-join-vhub > .pk-field { flex: 1; min-width: 0; }
.pk-join-name, .pk-lobby-name { font-size: 1.3em; font-weight: 700; }
.pk-join-under { font-size: 1.25em; font-weight: 600; }

/* Lobby (phone) */
.pk-lobby { display: grid; gap: 1em; }
.pk-lobby-me { display: flex; align-items: center; gap: 1.9em; }
.pk-lobby-watching, .pk-lobby-waiting { display: flex; align-items: center; gap: 0.5em; color: var(--pk-text-dim); }
.pk-lobby-links { display: flex; flex-wrap: wrap; gap: 0 1.1em; }
.pk-lobby-waiting { flex-wrap: wrap; justify-content: space-between; }
.pk-lobby-players { display: grid; gap: 0.6em; }
/* Another player's card (tapped in the lobby), with VHub's friend button (friend-button.tsx). */
.pk-player-card { display: grid; gap: 1em; }
.pk-player-card-level { color: var(--pk-text-dim); }
.pk-friend-box { display: grid; gap: 0.5em; }
.pk-friend-sent { display: flex; flex-wrap: wrap; align-items: center; gap: 0.75em; }
.pk-friend-tag { display: inline-flex; align-items: center; gap: 0.4em; font-weight: 700; }
.pk-root .pk-friend-yes { color: var(--pk-good); }
/* Toasts (toast.tsx: the friend button's Undo after Cancel): at the foot of the screen, over sheets, in the game's look,
   a line of its accent (its danger colour when something went wrong) down the left. motion.ts moves them, never this.
   On a phone they stand at the foot's centre, 16 px in, above the phone shell's foot (its action bar, which the shell
   measures into --pk-foot-h) or the safe area, and above a banner the page has scrolled into their place (toast.tsx
   sets --pk-toast-lift on this host alone). From 1024 px wide they stand at the bottom right, as the hub's do. */
.pk-toasts {
  position: fixed; z-index: 30; left: 16px; right: 16px;
  bottom: calc(16px + max(var(--pk-foot-h, 0px), env(safe-area-inset-bottom, 0px)) + var(--pk-toast-lift, 0px));
  display: grid; justify-items: center; gap: 8px; pointer-events: none;
}
.pk-toast {
  pointer-events: auto; display: flex; align-items: center; gap: 0.25em; width: 100%; max-width: 420px;
  padding: 0 0 0 1em; border: 1px solid var(--pk-rule); border-left: 4px solid var(--pk-accent); border-radius: 14px;
  background: var(--pk-card); color: var(--pk-text); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
}
.pk-toast-danger { border-left-color: var(--pk-danger); }
.pk-toast-text { flex: 1; min-width: 0; display: grid; gap: 0.15em; padding: 0.7em 0; line-height: 1.3; }
.pk-toast-text > span { color: var(--pk-text-dim); font-size: 0.92em; }
.pk-root .pk-toast-action {
  flex: none; min-height: 48px; padding: 0 0.8em; border: 0; border-radius: 10px; background: none;
  color: var(--pk-accent); font-size: 1em; font-weight: 700; cursor: var(--cursor-link, pointer);
}
@media (min-width: 1024px) {
  .pk-toasts { justify-items: end; }
}
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
/* A Fold's chevron (ui/expand.tsx; design-canon.md 1, the site's .faq-item .chev): it turns 180° with the row as it
   opens, and back as soon as the close starts, a little faster, on the canon's numbers. */
.pk-chev { transition: transform ${A.close}ms ${A.easing}; }
.pk-chev-open { transform: rotate(180deg); transition-duration: ${A.open}ms; }
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
/* The menu's groups (Palermo Noir's Settings proposal, approved 29 Oct 2026): a small heading in the accent over each,
   a little air between them. */
.pk-menu-group { display: grid; gap: 0.5em; }
.pk-menu-group + .pk-menu-group { margin-top: 0.6em; }
.pk-menu-head {
  margin: 0; color: var(--pk-accent); font-family: var(--pk-font-digits); font-size: 0.78em; font-weight: 700; letter-spacing: 0.1em;
  text-transform: uppercase;
}
/* The VHub account's row: the account button's circle, then the name and its line. */
.pk-menu-account {
  display: flex; align-items: center; gap: 0.8em; width: 100%; padding: 0.4em 0 0.7em; border: 0; border-bottom: 1px solid var(--pk-rule);
  background: none; color: inherit; font: inherit; text-align: start; cursor: var(--cursor-link, pointer);
}
.pk-menu-account:focus-visible { outline: 3px solid var(--pk-accent); outline-offset: 2px; }
.pk-menu-account-text { display: grid; flex: 1; min-width: 0; }
.pk-menu-account-text .pk-rule-label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
/* About, under its heading: the game's row unfolding its About page and version, then in every game the company's
   details and the terms, and "© 2026 VGraphics". */
.pk-menu-about-game { display: grid; justify-items: start; gap: 0.3em; padding: 0.2em 0.2em 0.4em; }
.pk-menu-about-game p { margin: 0; }
.pk-menu-about { display: grid; gap: 0.35em; }
.pk-menu-about-links { color: var(--pk-text-dim); }
.pk-menu-about-links a { color: var(--pk-accent); }
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
/* The TV's layers, bottom up: the scene (pk-tv-centre); the player strip (2); the game's overlays (pk-tv-overlay, 3: a
   first-time card); the top bar and the captions (4); the reconnecting banner, Press OK for sound and the leave dialog
   above all. */
/* The top bar: the logo, the stopwatch in the middle, the join panel; below it the scenes have the frame's whole width. */
.pk-tv-top {
  position: relative; z-index: 4; display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); align-items: start; gap: 48px;
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
.pk-tv-centre { display: flex; flex: 1; flex-direction: column; justify-content: center; min-height: 0; transition: opacity 0.3s ease; }
/* The host's pause (pk-tv-frame-paused; a guided demo's guide holding its clock isn't one): the scene steps back under
   the pause in the top bar; the strip and the captions stay lit. Opacity only: a filter would make the middle the
   whole-frame scenes' containing block. */
.pk-tv-frame-paused .pk-tv-centre { opacity: 0.3; }
/* A scene laid out on the whole frame (the lobby, the verdict, the truth): 1728x972 from the stage's 96,54. */
.pk-tv-fill { position: absolute; top: 0; right: 0; bottom: 0; left: 0; }
/* The game's overlays (TvShell's overlay): the whole frame, over the strip, under the top bar and the captions; only its
   own pieces take presses. Out of the middle, so the host's pause neither dims it nor sinks it under the strip. */
.pk-tv-overlay { position: absolute; top: 0; right: 0; bottom: 0; left: 0; z-index: 3; pointer-events: none; }
.pk-tv-overlay > * { pointer-events: auto; }
.pk-tv .pk-captions { position: relative; z-index: 4; display: flex; align-items: flex-end; justify-content: center; min-height: 120px; text-align: center; }
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
/* The host's pause: in the top bar, in the stopwatch's place, above the scenes and clear of their cards' tags, lifted off
   the scene that steps back under it (pk-tv-frame-paused). */
.pk-tv-paused {
  display: flex; align-items: center; gap: 16px; padding: 14px 32px; border: 2px solid var(--pk-accent); border-radius: 16px;
  background: var(--pk-panel); box-shadow: 0 16px 48px rgba(0, 0, 0, 0.55); font-size: 40px; white-space: nowrap;
}
.pk-tv-top > .pk-tv-paused { grid-column: 2; align-self: center; }
.pk-tv-banner {
  position: absolute; z-index: 4; bottom: 20px; left: 50%; display: flex; align-items: center; gap: 16px; padding: 14px 40px;
  border: 2px solid var(--pk-danger); border-radius: 16px; background: var(--pk-panel); font-size: 36px;
  transform: translateX(-50%);
}
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
/* The remote's focus: a thick ring that the arrows move from key to key, readable from the sofa. */
.pk-tv .pk-keypad .pk-key:focus {
  outline: 6px solid var(--pk-accent); outline-offset: 6px; transform: translateY(-4px);
  box-shadow: 0 0 0 16px rgba(var(--pk-accent-rgb), 0.16), inset 0 -6px 0 rgba(0, 0, 0, 0.35);
}
.pk-tv .pk-keypad .pk-key.pk-btn-primary:focus { outline-color: var(--pk-text); }
/* OK before the code is whole: an outline in the accent, lit once the twelfth digit is in (TvKeypad's pk-key-waiting). */
.pk-root .pk-keypad .pk-key.pk-btn-primary.pk-key-waiting { background: transparent; color: var(--pk-accent); }
.pk-root .pk-keypad .pk-key.pk-btn-primary.pk-key-waiting:focus { outline-color: var(--pk-accent); }
.pk-tv-code-wrong .pk-tv-code-digit { border-color: var(--pk-danger); color: var(--pk-danger); }
.pk-tv-code-going .pk-tv-code-digit { border-color: var(--pk-accent); color: var(--pk-accent); }
/* A refused code on the departure board looks the same on /tv and /join (George's doors review, 29 Oct 2026): red
   digits in a red ring, the board tiles' own lift kept. */
.pk-tv-code-board.pk-tv-code-wrong .pk-tv-code-digit { box-shadow: 0 0 0 3px var(--pk-danger), 0 5px 0 rgba(0, 0, 0, 0.45); }
/* The doors' layout B (George's pick, 29 Oct 2026: "B for both doors"), in the game's tokens, so a game's own TV door
   wears it too: the keys in one row (TvKeypad with the layout "row"), so a remote needs only left, right and OK; the
   code's digits as split-flap tiles on a dark board (TvCodeDigits' class pk-tv-code-board); a screen's demo code in a
   slim bar (TvPairCode's class pk-pair-bar). */
.pk-keypad-row { grid-template-columns: repeat(10, 104px) 170px 180px; gap: 12px; }
.pk-tv .pk-keypad-row .pk-key { min-height: 104px; font-size: 48px; }
.pk-tv .pk-keypad-row .pk-key-word { font-size: 30px; }
.pk-tv-code-board { gap: 10px; padding: 22px 28px; border: 2px solid rgba(var(--pk-text-rgb), 0.08); border-radius: 26px; background: rgba(var(--pk-ground-rgb), 0.72); }
.pk-tv-code-board .pk-tv-code-digit {
  width: 86px; height: 124px; border: 0; border-radius: 10px; font-size: 92px;
  background: linear-gradient(var(--pk-card) 0 49.3%, var(--pk-ground) 49.3% 50.7%, var(--pk-panel) 50.7%);
  box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.06), 0 5px 0 rgba(0, 0, 0, 0.45);
}
.pk-tv-code-board .pk-tv-code-digit:empty::before { content: ""; width: 26%; height: 4%; border-radius: 2px; background: rgba(var(--pk-text-rgb), 0.2); }
.pk-tv-code-board .pk-tv-code-digit-third { margin-right: 24px; }
.pk-tv-code-board .pk-tv-code-digit-next { box-shadow: 0 0 0 4px var(--pk-accent), 0 0 26px rgba(var(--pk-accent-rgb), 0.35); }
.pk-pair { display: flex; align-items: center; gap: 40px; }
.pk-qr-pair { flex: none; width: 300px; height: 300px; border-radius: 16px; }
.pk-pair-text { display: grid; gap: 16px; }
.pk-pair-label { justify-self: start; font-size: 30px; }
/* The pairing code's twelve digits in threes, a little smaller than a room code's cells: 654 px across. */
.pk-pair-code { gap: 6px; }
.pk-pair-code .pk-cell { width: 46px; height: 70px; font-size: 46px; }
.pk-pair-code .pk-cell-gap { margin-left: 12px; }
.pk-pair-help { max-width: 640px; color: var(--pk-text-dim); font-size: 32px; }
.pk-pair-bar { gap: 28px; padding: 18px 30px 18px 18px; border: 2px solid rgba(var(--pk-text-rgb), 0.08); border-radius: 22px; background: rgba(var(--pk-panel-rgb), 0.86); text-align: left; }
.pk-pair-bar .pk-qr-pair { width: 150px; height: 150px; }
.pk-pair-bar .pk-pair-text { gap: 10px; }
.pk-pair-bar .pk-pair-help { max-width: 560px; font-size: 24px; }
/* The remote's Back asks first (tv-shell.tsx LeaveDialog), moved by the kit's one motion piece (motion.ts;
   design-canon.md 2), never by CSS animations: the dialog rises from a little below its place as it and the scrim
   behind it fade in (260 ms), and on Stay goes back the same way, a little faster (200 ms). */
/* Behind the Back dialog: the whole stage dimmed (the frame sits 54 px and 96 px in from the stage's edges). */
.pk-tv-scrim {
  position: absolute; z-index: 6; top: -54px; right: -96px; bottom: -54px; left: -96px; background: rgba(var(--pk-ground-rgb), 0.78);
}
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
/* Greek labels keep their case and accents, as the doors' labels do (George's doors review, 29 Oct 2026: the TV lobby's
   tapes and the pair bar's label came out as accentless capitals). One rule for every tape. */
.pk-root[lang="el"] .pk-tape { text-transform: none; }
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
  -webkit-mask: ${Lt} center / contain no-repeat; mask: ${Lt} center / contain no-repeat;
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
/* An empty seat's tag, on one line (George's doors review, 29 Oct 2026: "Ελεύθερη θέση" wrapped under every seat; the
   Greek is now "Κενή θέση", as short as "Free seat"). */
.pk-tag-blank {
  border: 2px dashed rgba(var(--pk-text-rgb), 0.3); background: none; color: var(--pk-text-dim); font-size: 30px; font-weight: 600;
  line-height: 1.1; text-align: center; white-space: nowrap; transform: none; box-shadow: none;
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
   its time. Put it in TvShell's overlay, so it's over the strip too and a host's pause doesn't sink it. No inset
   shorthand: 2022 TVs run Chromium 85. */
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
/* ...but what opens and closes (rows, sheets, dialogs) never snaps: motion.ts fades it, short (150 ms in, 100 ms out),
   with Web Animations, which these rules don't cut. A Fold's chevron just flips. */

/* The simple stage: a TV that can't keep up (tv/simple-stage.ts). The art holds still, a card's turn becomes a crossfade
   from its back, and draw-ins that fly, pop or spin become plain fades, at their own times. Crossfades stay. */
.pk-stage-simple .pk-tv-art { animation: none; transform: scale(1.02); will-change: auto; }
.pk-stage-simple .pk-flip-turn { animation-name: none; transform: none; transform-style: flat; }
.pk-stage-simple .pk-flip-back { transform: none; animation: pk-fade-out 0.5s ease-out both; animation-delay: inherit; }
.pk-stage-simple .pk-stamp, .pk-stage-simple .pk-seal, .pk-stage-simple .pk-banner, .pk-stage-simple .pk-awards, .pk-stage-simple .pk-seat { animation-name: pk-fade; }
.pk-stage-simple .pk-live-dot { animation: none; }
@keyframes pk-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes pk-fade-out { from { opacity: 1; } to { opacity: 0; } }
${xo}`;function yo(t=typeof document>"u"?void 0:document){if(!t||t.getElementById("pk-styles"))return;const e=t.createElement("style");e.id="pk-styles",e.textContent=wo,t.head.appendChild(e)}function M(t,e,i){return`M${t-i} ${e}a${i} ${i} 0 1 0 ${2*i} 0a${i} ${i} 0 1 0 ${-2*i} 0`}const _o={alive:["M12 19.5s-7-4.2-7-9.6A3.9 3.9 0 0 1 12 7.6a3.9 3.9 0 0 1 7 2.3c0 5.4-7 9.6-7 9.6z"],captions:["M3.5 5.5h17v13h-17z","M10.5 10.2a2.2 2.2 0 1 0 0 3.6","M17 10.2a2.2 2.2 0 1 0 0 3.6"],cast:["M3.5 8V6.5a1 1 0 0 1 1-1h15a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H14","M3.5 18.5h.01","M3.5 15a3.5 3.5 0 0 1 3.5 3.5","M3.5 11.5a7 7 0 0 1 7 7"],check:["M5 12.5l4.5 4.5L19 7.5"],chevronDown:["M6 9.5l6 6 6-6"],chevronUp:["M6 14.5l6-6 6 6"],close:["M6.5 6.5l11 11","M17.5 6.5l-11 11"],crown:["M4.5 18.5h15","M5.5 18.5L4 8l4.5 3.5L12 5l3.5 6.5L20 8l-1.5 10.5"],eye:["M2.5 12s3.5-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.5 6.5-9.5 6.5S2.5 12 2.5 12z",M(12,12,3)],flag:["M5.5 20.5V4","M5.5 4.5h12l-2.5 4 2.5 4h-12"],globe:[M(12,12,8.5),"M3.5 12h17","M12 3.5c2.4 2.3 3.6 5.1 3.6 8.5s-1.2 6.2-3.6 8.5c-2.4-2.3-3.6-5.1-3.6-8.5s1.2-6.2 3.6-8.5z"],heart:["M12 19.5s-7-4.2-7-9.6A3.9 3.9 0 0 1 12 7.6a3.9 3.9 0 0 1 7 2.3c0 5.4-7 9.6-7 9.6z","M3.5 20.5L7 17","M18.5 5.5l2-2","M17 3.5h3.5V7"],info:[M(12,12,8.5),"M12 11v5.5","M12 7.8h.01"],kick:[M(9.5,7.5,3.5),"M3.5 19.5a6 6 0 0 1 12 0","M16.5 11h5"],lamp:["M12 21V10","M9 21h6","M8.5 10h7l-1.5-5h-4z","M12 2.5v1"],leave:["M14 4.5H6.5v15H14","M10.5 12h9","M16.5 8.5l3.5 3.5-3.5 3.5"],lock:["M6.5 10.5h11V20h-11z","M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"],mask:["M3 7.5c3-1.4 6-1.4 9 0 3-1.4 6-1.4 9 0 0 6-2.7 9.5-5.7 9.5-1.5 0-2.6-1.1-3.3-2.6-.7 1.5-1.8 2.6-3.3 2.6-3 0-5.7-3.5-5.7-9.5z","M6.8 11.2c1-.9 2.2-.9 3.2 0","M14 11.2c1-.9 2.2-.9 3.2 0"],menu:[M(6,12,1.1),M(12,12,1.1),M(18,12,1.1)],minus:["M5.5 12h13"],music:["M9 17.5V6l10-2v11.5",M(6.5,17.5,2.5),M(16.5,15.5,2.5)],next:["M6 5.5l9 6.5-9 6.5z","M18.5 5.5v13"],notebook:["M6.5 3.5h11a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1h-11z","M4.5 7h3","M4.5 12h3","M4.5 17h3","M10.5 8h5","M10.5 12h5"],offline:["M2.5 9a14 14 0 0 1 19 0","M5.5 12.5a9.5 9.5 0 0 1 13 0","M8.8 15.8a4.6 4.6 0 0 1 6.4 0","M12 19.5h.01","M4 4l16 16"],out:[M(12,12,8.5),"M6 6l12 12"],pause:["M8.5 5.5v13","M15.5 5.5v13"],phone:["M7.5 3h9a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z","M11 18h2"],play:["M7.5 5.2l11 6.8-11 6.8z"],plus:["M12 5.5v13","M5.5 12h13"],qr:["M4 4h6v6H4z","M14 4h6v6h-6z","M4 14h6v6H4z","M14 14h2.5v2.5H14z","M17.5 17.5H20V20h-2.5z","M17.5 14H20","M14 20h2.5"],question:[M(12,12,8.5),"M9.6 9.6a2.5 2.5 0 1 1 3.4 2.3c-.6.3-1 .8-1 1.5v.6","M12 16.8h.01"],ready:[M(12,12,8.5),"M8 12.3l2.8 2.8 5.4-5.5"],rose:[M(12,7.7,4.2),"M10 6.6c1.2-.9 2.8-.9 4 .4","M12 11.9V21","M12 15.5c-2-1.5-4-1-5 1","M12 18c2-1.5 4-1 5 1"],settings:["M4 7h8","M16 7h4","M4 17h4","M12 17h8","M14 5v4","M10 15v4"],share:["M12 14.5V4","M8 7.5L12 4l4 3.5","M5.5 11v8.5h13V11"],sound:["M4 9.5h3.5L12 5.5v13l-4.5-4H4z","M15.5 9a4 4 0 0 1 0 6","M18 6.5a7.5 7.5 0 0 1 0 11"],speaking:["M4 12h.01","M8 9v6","M12 6v12","M16 9v6","M20 11v2"],star:["M12 3.8l2.5 5.2 5.7.8-4.1 4 1 5.6-5.1-2.7-5.1 2.7 1-5.6-4.1-4 5.7-.8z"],table:["M3.5 5h17v14h-17z","M3.5 10h17","M9.5 10v9","M15 10v9"],textSize:["M3.5 18.5l4.5-12 4.5 12","M5.2 14h5.6","M14 18.5l3-8 3 8","M15.1 15.6h3.8"],timer:[M(12,13,7.5),"M12 9.5V13l2.5 2","M9.5 2.5h5"],tv:["M3.5 6h17v11.5h-17z","M8.5 21h7","M12 17.5V21"],unlock:["M6.5 10.5h11V20h-11z","M8.5 10.5V8a3.5 3.5 0 0 1 6.9-.8"],user:[M(12,8,3.5),"M5 20a7 7 0 0 1 14 0"],voted:["M4 13h16v7H4z","M7.5 13V4.5h9V13","M9.8 8.7l1.6 1.6 3-3"]};function To(t){return h("svg",{class:t.class?`pk-icon ${t.class}`:"pk-icon",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"1.75","stroke-linecap":"round","stroke-linejoin":"round","aria-hidden":"true",focusable:"false",children:_o[t.name].map((e,i)=>h("path",{d:e},i))})}const $=Q([]),Ct=new Map,R=Q([]);let So=1;const Ge=t=>{$.value=$.value.filter(e=>e.id!==t)};function pi(t,e=!1){var o;const i=$.value.find(n=>n.id===t);!i||i.going||(clearTimeout(Ct.get(t)),Ct.delete(t),R.value.length?$.value=$.value.map(n=>n.id===t?{...n,going:!0}:n):Ge(t),e||(o=i.onGone)==null||o.call(i))}function zo(t){var i;const e=$.value.find(o=>o.id===t);!e||e.going||(pi(t,!0),(i=e.onAction)==null||i.call(e))}function Mo(t){const e=it(),i=Me(null),{toast:o}=t;return be(()=>{const n=i.current;return n&&jt(n,null,"window",!0),()=>he(n)},[]),be(()=>{o.going&&(i.current?jt(i.current,null,"window",!1,()=>Ge(o.id)):Ge(o.id))},[o.going]),h("div",{ref:i,class:o.tone==="danger"?"pk-toast pk-toast-danger":"pk-toast",children:[h("div",{class:"pk-toast-text",children:[h("b",{children:e(o.title,o.params)}),o.body?h("span",{children:e(o.body)}):null]}),o.onAction?h("button",{type:"button",class:"pk-toast-action",onClick:()=>zo(o.id),children:e(o.action??"kit.toast.undo")}):null,h("button",{type:"button",class:"pk-icon-btn pk-toast-close","aria-label":e("kit.close"),onClick:()=>pi(o.id),children:h(To,{name:"close"})})]})}function jo(t,e){return!t||!e||e.bottom<=t.top||e.top>=t.bottom||e.right<=t.left||e.left>=t.right?0:t.bottom-e.top+8}function Lo(){const[t]=ve(()=>So++),e=Me(null);be(()=>(R.value=[...R.value,t],()=>{R.value=R.value.filter(n=>n!==t),R.value.length||($.value=$.value.filter(n=>!n.going))}),[]);const i=R.value[0]===t,o=i?$.value.length:0;return be(()=>{const n=e.current;if(!o||!n||typeof window>"u")return;let r=0;const a=()=>{var u;const l=[...n.children],c=n.getBoundingClientRect(),p=l.length?{top:c.top+r,bottom:c.bottom+r,left:c.left+Math.min(...l.map(s=>s.offsetLeft)),right:c.left+Math.max(...l.map(s=>s.offsetLeft+s.offsetWidth))}:null,d=jo(p,((u=document.querySelector(".pk-ad"))==null?void 0:u.getBoundingClientRect())??null);d!==r&&(r=d,r?n.style.setProperty("--pk-toast-lift",`${r}px`):n.style.removeProperty("--pk-toast-lift"))};return a(),window.addEventListener("scroll",a,{capture:!0,passive:!0}),window.addEventListener("resize",a),()=>{window.removeEventListener("scroll",a,{capture:!0}),window.removeEventListener("resize",a),n.style.removeProperty("--pk-toast-lift")}},[o]),i?h("div",{ref:e,class:"pk-toasts",role:"status","aria-live":"polite",children:$.value.map(n=>h(Mo,{toast:n},n.id))}):null}function Co(){let t=null;try{t=typeof location>"u"?null:new URLSearchParams(location.search).get("stage")}catch{t=null}return t==="simple"?{simple:!0,measure:!1,source:"forced"}:t==="full"?(Fi(Re.tvStage),{simple:!1,measure:!1,source:"forced"}):ke(Re.tvStage)==="simple"?{simple:!0,measure:!1,source:"stored"}:{simple:!1,measure:!0,source:"measured"}}const We=Co(),Ho=Q(We.simple);We.measure||We.simple;function li(t){Xi(),yo(),uo();const e=t.lang??q.value;go(e);const i=["pk-root",`pk-${t.surface}`];return et.value&&i.push("pk-calm"),t.surface==="tv"&&Ho.value&&i.push("pk-stage-simple"),t.class&&i.push(t.class),h(si.Provider,{value:e,children:h("div",{class:i.join(" "),"data-theme":t.theme??"palermo",lang:e,style:t.surface==="phone"?`--pk-scale:${oi.value}`:void 0,children:[t.children,t.surface==="phone"?h(Lo,{}):null]})})}function Io(t,e,i){return{"aria-disabled":t?"true":void 0,"aria-describedby":t?i:void 0,onClick:o=>{if(t){o.preventDefault(),o.stopPropagation();return}e==null||e(o)},onKeyDown:o=>{t&&(o.key==="Enter"||o.key===" ")&&o.preventDefault()}}}const di="party-legal",Ao={rights:"kit.legal.rights",company:"kit.legal.company",privacy:"kit.legal.privacy",terms:"kit.legal.terms"};function ci(){const t=it(),e=tt();return ze(()=>{for(const i of document.querySelectorAll(`#${di} [data-legal]`)){const o=Ao[i.dataset.legal??""];o!==void 0&&(i.textContent=t(o))}},[e]),null}const $o=1920,Qo=1080;function ki(t,e){const i=Math.min(t/$o,e/Qo);return i>0&&Number.isFinite(i)?i:1}function Ht(){return typeof window>"u"?1:ki(window.innerWidth,window.innerHeight)}function Po(t){const[e,i]=ve(Ht),o=Me(null);return ze(()=>{const n=()=>{const a=o.current;i(a&&a.clientWidth>0&&a.clientHeight>0?ki(a.clientWidth,a.clientHeight):Ht())};n(),window.addEventListener("resize",n);const r=typeof ResizeObserver>"u"||!o.current?null:new ResizeObserver(n);return r&&o.current&&r.observe(o.current),()=>{window.removeEventListener("resize",n),r==null||r.disconnect()}},[]),h("div",{ref:o,class:"pk-tv-viewport",children:[t.backdrop,h("div",{class:"pk-tv-stage",style:`transform:translate(-50%,-50%) scale(${e})`,children:t.children})]})}const Vo={"door.title.tv":"Το παιχνίδι σε αυτή την οθόνη","door.going":"Άνοιγμα του παιχνιδιού…","door.soon":"Αυτό το παιχνίδι δεν έχει ανοίξει ακόμα. Έλεγξε τον κωδικό.","door.language":"Γλώσσα","door.tv.help":"Γράψε τα δώδεκα ψηφία του κωδικού τηλεόρασης με τα πλήκτρα του τηλεχειριστηρίου και πάτησε OK.","door.tv.helpPhone":"Γράψε τα δώδεκα ψηφία του κωδικού τηλεόρασης και πάτησε OK.","door.tv.where":"Ο κωδικός τηλεόρασης είναι στο κινητό του οικοδεσπότη, στο «Στην τηλεόραση».","door.tv.phone":"Αυτή η σελίδα είναι για την τηλεόραση. Παίζεις από αυτό το κινητό;","door.tv.toJoin":"Πήγαινε στο {site}","door.join.tvHere":"Δείξε το παιχνίδι σε αυτή την οθόνη"},Oo={"door.title.tv":"Show the game on this screen","door.going":"Opening the game…","door.soon":"This game isn't open yet. Check the code.","door.language":"Language","door.tv.help":"Type the TV code's twelve digits with your remote's number keys, then press OK.","door.tv.helpPhone":"Type the TV code's twelve digits, then press OK.","door.tv.where":"The TV code is on the host's phone, under “Show on TV”.","door.tv.phone":"This page is for the TV. Playing on this phone?","door.tv.toJoin":"Go to {site}","door.join.tvHere":"Show the game on this screen"};function Go(){ao({el:Vo,en:Oo})}function Wo(t,e=q.value){return`${ri(e,t)} · VGraphics`}function Yo(t){return h(li,{surface:"phone",theme:"vgraphics",children:[h(ci,{}),h("div",{class:t.class?`door door-phone ${t.class}`:"door door-phone",children:[h("div",{class:"door-art","aria-hidden":"true"}),h("header",{class:"door-top",children:[h(ui,{class:"door-logo"}),h(Eo,{})]}),h("main",{class:"door-band",children:t.children}),h(hi,{})]})]})}function Bo(t){return h(li,{surface:"tv",theme:"vgraphics",lang:q.value,children:[h(ci,{}),h(Po,{backdrop:h("div",{class:"door-art door-art-tv","aria-hidden":"true"}),children:h("div",{class:"door door-tv",children:[h("header",{class:"door-top",children:h(ui,{class:"door-logo"})}),h("main",{class:"door-band",children:t.children}),h(hi,{})]})})]})}function hi(){const t=Me(null);return ze(()=>{const e=t.current,i=document.getElementById(di);if(!(!e||!i))return e.appendChild(i),()=>{i.parentElement===e&&document.body.appendChild(i)}},[]),h("div",{ref:t,class:"door-legal"})}const No="(max-width: 699px), (max-height: 499px)";function Uo(){const[t]=ve(()=>typeof window>"u"?null:window.matchMedia(No)),[e,i]=ve((t==null?void 0:t.matches)??!1);return ze(()=>{if(!t)return;const o=()=>i(t.matches);return t.addListener(o),()=>t.removeListener(o)},[]),e}function Eo(){const t=it(),e=tt()==="el"?"en":"el";return h("button",{type:"button",class:"pk-link door-lang","aria-label":t("door.language"),lang:e,onClick:()=>lo(e),children:co[e]})}function ui(t){return h("svg",{class:t.class,viewBox:"0 0 555 589",role:"img","aria-label":"VGraphics",children:[h("g",{fill:"currentColor",children:[h("path",{d:"M0.5 113.5H285.5V169.5H56.5V285.5H143L199 341.5H0.5Z"}),h("path",{d:"M133 244.5H217L445.5 473H361.5Z"}),h("path",{d:"M389.5 244.5H446.5V444.5L389.5 387.5Z"})]}),h("circle",{cx:"400.5",cy:"127.5",r:"59.5",fill:"#588FFA"}),h("circle",{cx:"513",cy:"152",r:"41",fill:"#4B4FD9"}),h("circle",{cx:"518",cy:"62",r:"29",fill:"#D2676C"}),h("circle",{cx:"447.5",cy:"27",r:"26.5",fill:"#E5B833"}),h("g",{fill:"currentColor",transform:"translate(39.02 586.76) scale(0.0754 -0.0754)",children:[h("path",{d:"M212 0L4 660L180 660L316 134L319 134L452 660L628 660L420 0Z"}),h("path",{transform:"translate(735 0)",d:"M301 -14Q215 -14 154 29Q92 72 60 149Q27 225 27 325Q27 399 46 463Q64 526 103 574Q142 621 202 648Q262 674 345 674Q415 674 466 655Q516 636 548 602Q580 568 593 524Q606 479 601 428L450 410Q452 455 439 484Q426 512 401 526Q375 540 339 540Q296 540 264 517Q232 494 215 448Q197 402 197 333Q197 282 207 242Q217 201 237 174Q257 146 287 132Q316 117 354 117Q392 117 419 131Q446 144 461 168Q475 191 475 222L371 222L371 336L619 336L619 212L619 0L508 0L508 178L499 178Q494 116 470 73Q445 30 403 8Q360 -14 301 -14Z"}),h("path",{transform:"translate(1524 0)",d:"M40 0L40 660L314 660Q358 660 398 653Q437 645 470 630Q502 615 526 592Q550 569 563 538Q576 506 576 466Q576 435 566 408Q555 380 533 358Q510 336 475 322Q439 307 390 301L390 293Q454 290 489 268Q524 246 542 213Q559 179 568 140L603 0L424 0L399 131Q393 165 381 186Q368 207 345 217Q322 227 284 227L202 227L202 0ZM202 352L296 352Q351 352 380 373Q409 394 409 437Q409 484 382 507Q355 530 300 530L202 530Z"}),h("path",{transform:"translate(2285 0)",d:"M4 0L225 660L435 660L655 0L480 0L332 529L326 529L177 0ZM129 117L129 231L550 231L550 117Z"}),h("path",{transform:"translate(3084 0)",d:"M161 187L161 317L284 317Q345 317 375 342Q405 366 405 423Q405 477 378 504Q350 530 294 530L161 530L161 660L303 660Q360 660 409 647Q458 633 495 604Q531 575 552 531Q572 487 572 425Q572 346 537 293Q501 240 434 214Q367 187 270 187ZM40 0L40 660L202 660L202 0Z"}),h("path",{transform:"translate(3810 0)",d:"M435 0L435 660L597 660L597 0ZM40 0L40 660L202 660L202 0ZM161 264L161 400L520 400L520 264Z"}),h("path",{transform:"translate(4587 0)",d:"M40 0L40 660L203 660L203 0Z"}),h("path",{transform:"translate(4970 0)",d:"M341 -14Q257 -14 197 13Q137 40 99 88Q61 136 44 198Q26 259 26 328Q26 399 44 462Q62 525 100 573Q137 620 196 647Q255 674 338 674Q410 674 462 654Q514 633 546 598Q577 562 589 516Q601 470 595 420L446 402Q448 445 436 476Q423 507 398 524Q372 541 333 541Q300 541 275 528Q249 515 232 489Q214 463 205 425Q196 386 196 335Q196 269 212 221Q228 172 261 146Q294 119 344 119Q390 119 417 140Q443 161 454 198Q465 235 461 281L614 268Q619 213 607 163Q594 112 562 72Q529 32 475 9Q420 -14 341 -14Z"}),h("path",{transform:"translate(5747 0)",d:"M299 -14Q229 -14 177 2Q124 18 89 48Q54 78 38 121Q21 163 23 215L173 248Q175 202 193 174Q210 145 240 132Q270 118 307 118Q337 118 360 126Q383 133 397 147Q410 160 410 178Q410 202 392 218Q374 233 343 244Q311 255 271 266Q228 278 186 293Q143 307 108 329Q73 351 52 386Q30 421 30 473Q30 537 63 582Q95 627 153 651Q210 674 284 674Q362 674 423 648Q484 621 517 570Q550 519 543 445L395 421Q396 451 389 474Q382 497 368 513Q353 529 331 538Q309 546 279 546Q248 546 228 538Q207 530 197 516Q186 502 186 484Q186 463 202 449Q218 435 248 425Q278 414 319 403Q362 391 406 377Q449 362 486 339Q523 315 546 278Q568 241 568 184Q568 118 534 74Q499 30 439 8Q378 -14 299 -14Z"})]})]})}export{Me as A,Yo as P,Ro as R,Do as S,Bo as T,it as a,Wo as b,Uo as c,ve as d,oe as e,ze as h,Go as l,Io as o,q as p,h as u};
