(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  var strats = {}; // 定义钩子

  var LIFYCYCLE = ['beforeCreate', 'created']; // 处理 mixin中的生命钩子和主页面的生命钩子  合并成数组，然后遍历执行钩子  即调用calHook(vm,hook)函数
  // p和c：假装是created函数
  // 1.首次进入 p是没有的 所有直接返回 [c], 首次必定有c 不然进入不了   {} =>  [created:fn]
  // 2.再次合并 如果 p(即上次返回的 [c] )有,而新的c无 直接返回 p   或者 是 p 有 c有则合并返回

  LIFYCYCLE.forEach(function (hook) {
    strats[hook] = function (p, c) {
      if (c) {
        if (p) {
          return p.concat(c);
        } else {
          return [c];
        }
      } else {
        return p;
      }
    };
  }); // 属性合并

  function mergeOptions(parent, child) {
    var options = {}; // console.log('parent',parent);
    // console.log('child',child);

    for (var key in parent) {
      mergeField(key);
    }

    for (var _key in child) {
      if (!parent.hasOwnProperty(_key)) {
        mergeField(_key);
      }
    } // 1.首次所有属性都放入 options 中
    // 2.再次调用 mergeOptions 合并属性时，如果新传入的child中有，并且属性不在LIFYCYCLE中，直接新的属性直接覆盖


    function mergeField(key) {
      // console.log('mergeField',key);
      // 如果是LIFYCYCLE中定义的钩子 需要单独处理
      if (strats[key]) {
        options[key] = strats[key](parent[key], child[key]);
      } else {
        // 如果新的合并回合  父和子都有相同属性 用‘子’也就是（新的mixin中的属性替换旧的mixin中的属性）
        options[key] = child[key] || parent[key];
      }
    }

    console.log('options', options);
    return options;
  }

  function initGlobalAPI(Vue) {
    Vue.options = {};

    Vue.mixin = function (mixin) {
      // console.log('mixin----------',mixin);
      this.options = mergeOptions(this.options, mixin);
    };
  }

  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;

    var _s, _e;

    try {
      for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var ncname = "[a-zA-z_][\\-\\.0-9_a-zA-z]*";
  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")");
  var startTagOpen = new RegExp("^<".concat(qnameCapture)); //匹配标签名 <div

  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); //匹配结束标签名 </div>
  // 第一个分组就是属性的key value就是分组3/4/5

  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; //匹配属性

  var startTagClose = /^\s*(\/?)>/; //开始标签的结束 ' > '
  // 对模板进行编译处理（vue3采用的不是正则）或者使用插件 htmlparser2 解析

  function parseHTML(html) {
    var TEXT_TYPE = 3,
        //文本类型
    ELEMENT_TYPE = 1,
        //元素类型
    stack = []; //存为元素

    var currentParent; //指向栈中的最后一个

    var root; //根节点
    // 创建ast树

    function createASTElement(tag, attrs) {
      return {
        tag: tag,
        attrs: attrs,
        children: [],
        type: ELEMENT_TYPE,
        parent: null
      };
    } // 利用栈型结构，来构造一颗树 通过每次匹配判断标签开始与结束 判断进栈出栈 由此可以清晰知道当前节点所属位置


    function start(tag, attrs) {
      var node = createASTElement(tag, attrs); // 看下是否是空树 如果是当前树就是根节点

      if (!root) {
        root = node;
      } // 如果当前节点的父节点存在，设置当前节点的父节点，以及给父节点添加儿子节点


      if (currentParent) {
        node.parent = currentParent;
        currentParent.children.push(node);
      } // 使用栈的进出判断当前节点以及其父节点


      stack.push(node);
      currentParent = node;
    }

    function chars(text) {
      // 去除所有空格  这里会把文本中的空格也给去除调
      // text = text.replace(/\s/g,'')
      text = text.trim();
      text && currentParent.children.push({
        type: TEXT_TYPE,
        text: text,
        parent: currentParent
      });
    }

    function end(tag) {
      stack.pop(); // 当前父节点，就是栈最后一个

      currentParent = stack[stack.length - 1];
    } // 去除匹配到了


    function advance(n) {
      html = html.substring(n);
    } // 开始标签匹配处理


    function parseStartTag() {
      var start = html.match(startTagOpen); //start: [0: "<div"  1: "div"]

      if (start) {
        var match = {
          tagName: start[1],
          attrs: []
        }; // 匹配到之后 去除匹配开始标签

        advance(start[0].length);

        var attr, _end; // 当不是开始标签的结束时，而是属性则一直匹配 


        while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
          // 将匹配得属性部分删除
          advance(attr[0].length); //通过正则匹配 1是属性名 2是‘：’ 3/4/5位是属性的值  true处理disabled这种属性

          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5] || true
          });
        } // 当匹配到开始标签得结束 > 时 删除 > 


        if (_end) {
          advance(_end[0].length);
        }

        return match;
      }

      return false;
    } // 通过正则匹配开始标签 结束标签 字符 进行分类处理


    while (html) {
      // 为0代表是一个开始标签或者结束标签
      var textEnd = html.indexOf('<'); // 开始标签或者结束标签

      if (textEnd == 0) {
        // 当匹配到开始标签
        var startTagMatch = parseStartTag();

        if (startTagMatch) {
          // 处理开始标签为ast树
          start(startTagMatch.tagName, startTagMatch.attrs);
          continue;
        } // 如果是结束标签


        var endTagMatch = html.match(endTag);

        if (endTagMatch) {
          advance(endTagMatch[0].length);
          end(endTagMatch[1]);
          continue;
        }

        break;
      } // 如果是文本


      if (textEnd > 0) {
        // 获取文本部分
        var text = html.substring(0, textEnd); // 删除文本部分

        advance(text.length); // 将文本处理成ast树

        chars(text);
      }
    }

    return root;
  }

  var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; //{{xx}} 匹配表达式的变量
  // 属性切割

  function genProps(attrs) {
    var str = '';

    for (var i = 0; i < attrs.length; i++) {
      var attr = attrs[i]; // 如果是style属性单独切割处理

      if (attr.name == 'style') {
        (function () {
          var obj = {};
          attr.value.split(';').map(function (item) {
            var _item$split = item.split(':'),
                _item$split2 = _slicedToArray(_item$split, 2),
                key = _item$split2[0],
                value = _item$split2[1];

            obj[key] = value;
          });
          attr.value = obj;
        })();
      }

      str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ",");
    }

    return "{".concat(str.slice(0, -1), "}");
  }

  function genChildren(children) {
    return children.map(function (child) {
      return gen(child);
    }).join(',');
  }

  function gen(node) {
    // 如果子节点是元素节点再次生成
    if (node.type === 1) {
      return codegen(node);
    } else {
      // 如果是文本类型
      var text = node.text; // 如果没有匹配到 {{ }}  注意：/xxx/g.test() /xxx/g.exec(text))  匹配成功后的lastIndex 会变化

      if (!defaultTagRE.test(text)) {
        return "_v(".concat(JSON.stringify(text), ")");
      } else {
        var tokens = [];
        var match;
        var lastIndex = 0; // 这里一定得设置为0 否则只会匹配到最后一个值（是因为使用了g全局匹配会导致这种问题）

        defaultTagRE.lastIndex = 0; // match : [0: "{{name}}", 1: "name",groups: undefined,index: 0,input: "{{name}} 今年 {{age}} 岁了， 喜欢打篮球"]

        while (match = defaultTagRE.exec(text)) {
          var index = match.index; //当前匹配到的下标
          // 如果匹配的 '文字 {{}} ' 前面还有 其他文本 直接放入

          if (index > lastIndex) {
            tokens.push(JSON.stringify(text.slice(lastIndex, index)));
          } // 重新设置当前匹配后的位置


          lastIndex = index + match[0].length; // console.log('match[1]',match[1],`${match[1]}`);

          tokens.push("_s(".concat(match[1], ")"));
        } //  匹配完成了 '{{}} 文字' 最后如果还有 文字也得放入进来


        if (lastIndex < text.length) {
          tokens.push(JSON.stringify(text.slice(lastIndex)));
        }

        return "_v(".concat(tokens.join('+'), ")");
      }
    }
  } // 将ast语法树转换成render函数  _c  _s替换{{}}  _v 文本


  function codegen(ast) {
    var children = genChildren(ast.children);
    var code = "_c('".concat(ast.tag, "',").concat(ast.attrs.length > 0 ? genProps(ast.attrs) : 'null').concat(ast.children.length > 0 ? ",".concat(children) : '', ")");
    return code;
  } //对模板进行编译处理


  function compileToFunction(template) {
    // 1. 将template转化成ast树
    var ast = parseHTML(template);
    console.log('ast', ast); // 2. 生成render方法 将ast语法树转换成render函数
    // 模板引擎的实现原理 就是 with + new Function

    var code = codegen(ast);
    console.log('code', this, code); // c('div',{id:"app",class:"999",style:{"color":" #f33","font-size":"18px"}},_c('div',{style:{"color":" #ff3"}},_v(_s(name)+" 你 "+_s(age)+"  好111")),_c('span',null,_v("hello")))
    // 因为with 当this传入vm的时候，_s(xxx)中的变量会自动去vm上拿取

    code = "with(this){return ".concat(code, "} ");
    var render = new Function(code);
    return render;
  }

  var id$1 = 0;

  var Dep = /*#__PURE__*/function () {
    function Dep() {
      _classCallCheck(this, Dep);

      this.id = id$1++;
      this.subs = [];
    }

    _createClass(Dep, [{
      key: "depend",
      value: function depend() {
        // （dep 和 watcher 是多对多的关系  一个属性在多个组件中使用  dep -> 多个watcher）
        // 一个组件中有多个属性 watcher -> 多个dep
        // this.subs.push(Dep.target)
        Dep.target.addDep(this);
      }
    }, {
      key: "addSub",
      value: function addSub(watcher) {
        this.subs.push(watcher);
      } // watcher 更新

    }, {
      key: "notify",
      value: function notify() {
        this.subs.forEach(function (watcher) {
          return watcher.update();
        });
      }
    }]);

    return Dep;
  }();

  Dep.target = null;

  //2) 当调用_render() 会进行取值操作 走到get上

  var id = 0;

  var Watcher = /*#__PURE__*/function () {
    function Watcher(vm, fn, _boolean) {
      _classCallCheck(this, Watcher);

      this.id = id++;
      this.renderWatcher = _boolean; //true 表示是一个渲染watcher

      this.getter = fn; //

      this.deps = [];
      this.depId = new Set();
      this.get();
    } // 一个组件对应多个属性 重复属性不用记录


    _createClass(Watcher, [{
      key: "addDep",
      value: function addDep(dep) {
        if (!this.depId.has(dep.id)) {
          this.deps.push(dep);
          this.depId.add(dep.id);
          dep.addSub(this);
        }
      }
    }, {
      key: "get",
      value: function get() {
        Dep.target = this;
        this.getter();
        Dep.target = null;
      } // 设置新值的时候才会走

    }, {
      key: "update",
      value: function update() {
        console.log('update');
        queueWatcher(this);
      }
    }, {
      key: "run",
      value: function run() {
        console.log('----------run------------');
        this.get();
      }
    }]);

    return Watcher;
  }(); // （每个属性都有一个dep  watcher相当一个视图）
  // 一个组件中 有多个属性（n个属性形成一个视图） n个dep对应一个watcher
  // 一个属性对应着多个组件 1个dep对应着多个watcher 
  // dep 和 watcher 多对多的关系
  // 使用队列 防止属性多次修改 多次执行更新


  var queue = [];
  var has = {};
  var pending = false;

  function flashSchedulerQueue() {
    var flashQueue = queue.slice(0);
    queue = [];
    has = {};
    pending = false;
    flashQueue.forEach(function (q) {
      return q.run();
    });
  }

  function queueWatcher(watcher) {
    var id = watcher.id;

    if (!has[id]) {
      has[id] = true;
      queue.push(watcher); // 多次修改属性的值  只会执行一次（使用了宏任务setTimeout）
      // 不论update执行多少次 但是最终只执行一轮刷新操作

      if (!pending) {
        nextTick(flashSchedulerQueue);
        pending = true;
      }
    }
  }

  var callbacks = [];
  var waiting = false;
  var timerFunc; // 按照队列顺序执行回调

  function flashCallback() {
    var cbs = callbacks.slice(0); // console.log('cbs--------',cbs);

    callbacks = [];
    waiting = false;
    cbs.forEach(function (cb) {
      return cb();
    });
  } // nextTick 不是维护了一个异步任务   而是将这个任务维护到了队列中


  function nextTick(cb) {
    callbacks.push(cb); // console.log('cb',callbacks,cb);

    if (!waiting) {
      // setTimeout(()=>{
      //   // 最后一起刷新
      //   flashCallback();
      // },0)
      timerFunc();
      waiting = true;
    }
  } // vue中的 nextTick没有直接采用某个api 而是采用优雅降级的方式
  // 内部首先采用promise(ie 不兼容) MutationObserver(h5 的api)  ie专项 setImmediate

  if (Promise) {
    timerFunc = function timerFunc() {
      Promise.resolve().then(flashCallback);
    };
  } else if (MutationObserver) {
    var observer = new MutationObserver(flashCallback);
    var textNode = document.createTextNode(1);
    observer.observe(textNode, {
      characterData: true //节点内容或节点文本的变动。

    });

    timerFunc = function timerFunc() {
      textNode.textContent = 2;
    };
  } else if (setImmediate) {
    timerFunc = function timerFunc() {
      setImmediate(flashCallback);
    };
  } else {
    timerFunc = function timerFunc() {
      setTimeout(flashCallback);
    };
  }

  //  _h() _c()
  function createElementVNode(vm, tag, data) {
    // console.log('66666666',tag,data,children);
    if (data == null) {
      data = {};
    } // 不明白这里为什么要把key删除
    // let key = data.key;
    // if(key){
    //   delete data.key
    // }


    for (var _len = arguments.length, children = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
      children[_key - 3] = arguments[_key];
    }

    return vnode(vm, tag, data.key, data, children);
  } // _v()

  function createTextVNode(vm, text) {
    return vnode(vm, undefined, undefined, undefined, undefined, text);
  }

  function vnode(vm, tag, key, data, children, text) {
    return {
      vm: vm,
      tag: tag,
      key: key,
      data: data,
      children: children,
      text: text
    };
  }

  function createElm(vnode) {
    var tag = vnode.tag,
        data = vnode.data,
        text = vnode.text,
        children = vnode.children;

    if (typeof tag === 'string') {
      vnode.el = document.createElement(tag);
      patchProps(vnode.el, data);
      children.forEach(function (child) {
        vnode.el.appendChild(createElm(child));
      });
    } else {
      vnode.el = document.createTextNode(text);
    }

    return vnode.el;
  } // 更新属性


  function patchProps(el, props) {
    for (var key in props) {
      if (key === 'style') {
        for (var styleName in props.style) {
          el.style[styleName] = props.style[styleName];
        }
      } else {
        el.setAttribute(key, props[key]);
      }
    }
  } // 创建真实DOM节点


  function patch(oldVNode, vnode) {
    // 看是否是真实的元素节点
    var isRealElement = oldVNode.nodeType; // console.log('isRealElement',oldVNode,vnode,isRealElement);

    if (isRealElement) {
      var elm = oldVNode;
      var parentElm = elm.parentNode; //拿到父元素
      // 将虚拟DOM转为真实DOM

      var newElm = createElm(vnode);
      parentElm.insertBefore(newElm, elm.nextSibling); //插入新节点

      parentElm.removeChild(elm); //删除老节点
      // 将新的节点返回，重新赋值 $el 用于下次更新

      return newElm;
    }
  }

  function initLifeCycle(Vue) {
    Vue.prototype._update = function (vnode) {
      var vm = this;
      var el = vm.$el; // 这里patch既有初始化方法  又有更新（vm.$el重新赋值新的节点） 

      vm.$el = patch(el, vnode);
    };

    Vue.prototype._render = function () {
      // console.log('this.$options.render',this.$options.render);
      // 指向Vue 因为render函数使用with 当this传入vm的时候，_s(xxx)中的变量会自动去vm上拿取
      return this.$options.render.call(this);
    };

    Vue.prototype._c = function () {
      // console.log('1',arguments);
      return createElementVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };

    Vue.prototype._v = function () {
      // console.log('2',arguments);
      return createTextVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    }; // 因为render函数使用with的原因 所以_s(xxx)中的变量 可以直接获取对应的值


    Vue.prototype._s = function (value) {
      // console.log('3',value);
      if (_typeof(value) !== 'object') return value;
      return JSON.stringify(value);
    };
  }
  function mountComponent(vm, el) {
    vm.$el = el; // 1.调用render方法产生虚拟节点，虚拟DOM
    // console.log('vm----------',vm,vm._render());

    var updateComponents = function updateComponents() {
      vm._update(vm._render()); // 更新组件渲染

    }; // debugger
    // watcher 相当于一个观察者  dep则是收集者 


    var watcher = new Watcher(vm, updateComponents, true); //true 用于标识 是一个渲染watcher

    console.log('watcher', watcher); // 2.根据虚拟DOM产生真实DOM
    // 3.插入到el元素中
  } // 生命周期钩子遍历执行

  function calHook(vm, hook) {
    console.log('hook', hook); // 如果钩子函数的数组存在

    var handles = vm.$options[hook];
    handles && handles.forEach(function (handle) {
      return handle();
    });
  }

  var oldArrayProto = Array.prototype; //获取数组原型
  // 获取新的实例原型  不影响原数组方法

  var newArrayProto = Object.create(oldArrayProto); // 找到所有变异方法

  var methods = ['push', 'pop', 'shift', 'unshift', 'reverse', 'sort', 'splice'];
  methods.forEach(function (method) {
    // 数组方法的重新
    newArrayProto[method] = function () {
      var _oldArrayProto$method;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      // console.log('------this-----',this,args);
      // 内部还是调用了原来的方法
      var result = (_oldArrayProto$method = oldArrayProto[method]).call.apply(_oldArrayProto$method, [this].concat(args)); // 我们对新增的数据进行劫持


      var inserted;
      var ob = this.__ob__;

      switch (method) {
        case 'push':
        case 'unshift':
          inserted = args;
          break;

        case 'splice':
          //arr.splice(0,1,{age:18},{a:1})
          inserted = args.slice(2);
          break;
      }

      if (inserted) {
        // 对新增的内容再次进行观测
        ob.observeArray(inserted);
      }

      console.log('inserted', inserted);
      return result;
    };
  });

  var Observer = /*#__PURE__*/function () {
    function Observer(data) {
      _classCallCheck(this, Observer);

      // 为了数组能够使用 observeArray 去观测新增的数据
      Object.defineProperty(data, '__ob__', {
        value: this,
        enumerable: false
      }); // 如果是数组就不再一个个劫持  太浪费性能了 (数组劫持的核心，就是重写数组的方法，对新增的属性进行判断和观测)

      if (Array.isArray(data)) {
        // 对数组7个变异方法进行重写
        data.__proto__ = newArrayProto; // 如果数组中放的是对象，可以检测其变化

        this.observeArray(data);
      } else {
        // Object.defineProperty 只能劫持已经存在的属性（vue里面会为此单独写一些api $set $delete）
        this.walk(data);
      }
    } // 循环对象依次进行劫持


    _createClass(Observer, [{
      key: "walk",
      value: function walk(data) {
        // “重新定义” 属性 因此vue2性能会有点差
        Object.keys(data).forEach(function (key) {
          defineReactive(data, key, data[key]);
        });
      } // 观测数组 对数组中的对象进行劫持

    }, {
      key: "observeArray",
      value: function observeArray(data) {
        data.forEach(function (item) {
          observe(item);
        });
      }
    }]);

    return Observer;
  }(); // 数据劫持  闭包 属性劫持


  function defineReactive(target, key, value) {
    // 如果值是对象再次进行劫持
    observe(value);
    var dep = new Dep();
    Object.defineProperty(target, key, {
      get: function get() {
        // 让这个属性的收集器记住当前的watcher
        // console.log('Dep.target',Dep.target);
        if (Dep.target) {
          dep.depend();
        }

        console.log('获取', key);
        return value;
      },
      set: function set(newVal) {
        console.log('设置');
        if (newVal === value) return;
        observe(newVal); // 用户给新值重新赋值对象，需要再次代理

        value = newVal; // 重新渲染页面

        dep.notify();
      }
    });
  }
  function observe(data) {
    // 只对对象进行劫持
    if (_typeof(data) != 'object' || data == null) return; // 说明对象已经被代理过了

    if (data.__ob__ instanceof Observer) {
      return data.__ob__;
    } // 若果一个对象被劫持过了，那就不需要再被劫持了（要判断一个对象是否被劫持过，可以添加一个实例，用实例来判断是否被劫持过）


    new Observer(data);
  }

  function initState(vm) {
    var opts = vm.$options;

    if (opts.data) {
      initData(vm);
    }
  } // 数据初始化

  function initData(vm) {
    var data = vm.$options.data; //data可能是函数和对象 vue3认定是函数
    // 疑问这里data函数的指向就是vm 为什么要call

    data = typeof data == 'function' ? data.call(vm) : data;
    vm._data = data; //将返回的对象放到_data上
    // 对于数据进行劫持 vue2里采用了一个api defineProperty

    observe(data); // 将vm._data 用vm来代理  方便用户获取

    for (var key in data) {
      proxy(vm, '_data', key);
    }
  } // vm.xxx  代理到 vm._data.xxx


  function proxy(vm, target, key) {
    Object.defineProperty(vm, key, {
      get: function get() {
        return vm[target][key];
      },
      set: function set(value) {
        vm[target][key] = value;
      }
    });
  }

  function initMinx(Vue) {
    // 初始化
    Vue.prototype._init = function (options) {
      var vm = this; // this.constructor.options  是gloabAPI.js 中 定义的

      vm.$options = mergeOptions(this.constructor.options, options); // vm.$options = options;// 将选项挂载到实例上  data,create,methods...

      calHook(vm, 'beforeCreate'); // 状态初始化

      initState(vm);
      calHook(vm, 'created'); // 模板初始化

      if (options.el) {
        vm.$mount(options.el);
      }
    };

    Vue.prototype.$mount = function (el) {
      var vm = this;
      var ops = vm.$options;
      el = document.querySelector(el); // 先看有没有render函数

      if (!ops.render) {
        var template;

        if (!ops.template && el) {
          template = el.outerHTML;
        } else {
          template = ops.template;
        } // 去生成render函数


        if (template) {
          // 对模板进行编译
          var render = compileToFunction(template);
          ops.render = render;
        }
      } // 组件挂载


      mountComponent(vm, el);
    };
  }

  function Vue(options) {
    // 初始化
    this._init(options);
  }

  Vue.prototype.$nextTick = nextTick; // 扩展了init 方法

  initMinx(Vue); // 

  initLifeCycle(Vue);
  initGlobalAPI(Vue);

  return Vue;

}));
//# sourceMappingURL=vue.js.map
