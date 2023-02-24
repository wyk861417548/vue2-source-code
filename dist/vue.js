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
  });

  strats.components = function () {
    var parentVal = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var childVal = arguments.length > 1 ? arguments[1] : undefined;
    // console.log('parentVal',parentVal,childVal);
    var res = Object.create(parentVal);

    if (childVal) {
      for (var key in childVal) {
        res[key] = childVal[key]; //返回的是构造的对象 ，建立了原型的父子关系
      }
    }

    return res;
  }; // 属性合并


  function mergeOptions(parent, child) {
    var options = {};

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

    console.log('options-------------', options);
    return options;
  }

  function initGlobalAPI(Vue) {
    // 静态方法
    Vue.options = {
      _base: Vue
    };

    Vue.mixin = function (mixin) {
      // console.log('mixin----------',mixin);
      this.options = mergeOptions(this.options, mixin);
    };

    Vue.extend = function (options) {
      //使用组合继承 
      function Sub() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        // debugger
        this._init(options); //默认对子类进行初始化操作

      }

      Sub.prototype = Object.create(Vue.prototype);
      Sub.prototype.constructor = Sub; // debugger
      // 自己options中components[key](每一个组件)的和全局（Vue.options）的components[key]（每一个组件）建立一个联系（prototype联系）
      // 通过components查找如果自己有使用自己的，如果没有去原型上找找到使用全局的

      Sub.options = mergeOptions(Vue.options, options);
      return Sub;
    };

    Vue.options.components = {};

    Vue.component = function (id, definition) {
      // 如果definition已经是一个函数了，那么说明用户自己调用了Vue.extend
      // debugger
      definition = typeof definition === 'function' ? definition : Vue.extend(definition);
      Vue.options.components[id] = definition;
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
    var ast = parseHTML(template); // console.log('ast',ast);
    // 2. 生成render方法 将ast语法树转换成render函数
    // 模板引擎的实现原理 就是 with + new Function

    var code = codegen(ast); // console.log('code',this,code);
    // c('div',{id:"app",class:"999",style:{"color":" #f33","font-size":"18px"}},_c('div',{style:{"color":" #ff3"}},_v(_s(name)+" 你 "+_s(age)+"  好111")),_c('span',null,_v("hello")))
    // 因为with 当this传入vm的时候，_s(xxx)中的变量会自动去vm上拿取

    code = "with(this){return ".concat(code, "} ");
    var render = new Function(code);
    return render;
  }

  var id$1 = 0;

  var Dep = /*#__PURE__*/function () {
    function Dep() {
      _classCallCheck(this, Dep);

      // console.log('Dep--------',id);
      this.id = id$1++;
      this.subs = [];
    }

    _createClass(Dep, [{
      key: "depend",
      value: function depend() {
        // （dep 和 watcher 是多对多的关系  一个属性在多个组件中使用  dep -> 多个watcher）
        // 一个组件中有多个属性 watcher -> 多个dep
        // this.subs.push(Dep.target)
        // addDep是watcher的方法
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

  Dep.target = null; // 创建栈用于存储多个wathcer

  var stack = [];
  function pushTarget(watcher) {
    Dep.target = watcher;
    stack.push(watcher);
  }
  function popTarget() {
    stack.pop();
    Dep.target = stack[stack.length - 1];
  }

  //2) 当调用_render() 会进行取值操作 走到get上

  var id = 0;

  var Watcher = /*#__PURE__*/function () {
    function Watcher(vm, exprOrFn, options, cb) {
      _classCallCheck(this, Watcher);

      this.id = id++;
      this.vm = vm;
      this.renderWatcher = options; //true 表示是一个渲染watcher
      // watch:{name:()=>{}}  exprOrFn:'name'  cb:()=>{}  如果exprOrFn是字符串包裹成函数

      if (typeof exprOrFn === 'string') {
        this.getter = function () {
          return vm[exprOrFn];
        };
      } else {
        this.getter = exprOrFn;
      }

      this.deps = [];
      this.depId = new Set();
      this.lazy = options.lazy; //用于标识自己来源是computed方法

      this.dirty = this.lazy; //脏值判断（用于判断computed方法是否缓存，是直接把watcher的value返回，否则再次调用evaluate计算新值）

      this.user = options.user; //标识是自己watcher

      this.cb = cb; //watch方法的回调
      // 这里存储第一次的值  用作watch的oldVal

      this.value = this.lazy ? undefined : this.get();
    } // 一个组件对应多个属性 重复属性不用记录


    _createClass(Watcher, [{
      key: "addDep",
      value: function addDep(dep) {
        if (!this.depId.has(dep.id)) {
          this.deps.push(dep);
          this.depId.add(dep.id);
          dep.addSub(this);
        }
      } // 计算属性通过计算watcher获取对应的值

    }, {
      key: "evaluate",
      value: function evaluate() {
        this.value = this.get();
        this.dirty = false; //计算属性计算一次后  缓存计算值
      } // 让当前的计算属性去记住 渲染watcher 

    }, {
      key: "depend",
      value: function depend() {
        var i = this.deps.length;

        while (i--) {
          this.deps[i].depend();
        } // console.log('this.deps',this.deps);

      } // 计算属性的 getter只是获取值 并不是更新视图的函数

    }, {
      key: "get",
      value: function get() {
        // console.log('-----this',this);
        pushTarget(this);
        var value = this.getter.call(this.vm);
        popTarget();
        return value;
      } // 设置新值的时候才会走

    }, {
      key: "update",
      value: function update() {
        // 1.当计算属性的 某个值（记住了计算watcher 和 渲染watcher）更改时 会执行dep.notify 对队列中的watcher执行update方法 
        // 2.首先调用计算watcher 设置dirty为真，使计算属性走evaluate方法 更新计算属性值
        // 3.再调用渲染watcher更新视图
        if (this.lazy) {
          this.dirty = true;
        } else {
          queueWatcher(this);
        }
      }
    }, {
      key: "run",
      value: function run() {
        console.log('----------run------------');
        var oldVal = this.value;
        var newVal = this.get();

        if (this.user) {
          this.cb.call(this.vm, newVal, oldVal);
        }
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

  var isReservedTag = function isReservedTag(tag) {
    return ['a', 'div', 'p', 'button', 'ul', 'li', 'span'].includes(tag);
  }; //  _h() _c()


  function createElementVNode(vm, tag, data) {
    // console.log('66666666',tag,data,children);
    if (data == null) {
      data = {};
    } // 不明白这里为什么要把key删除
    // let key = data.key;
    // if(key){
    //   delete data.key
    // }
    // 如果是真实dom


    for (var _len = arguments.length, children = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
      children[_key - 3] = arguments[_key];
    }

    if (isReservedTag(tag)) {
      return vnode(vm, tag, data.key, data, children);
    } else {
      console.log('vm.$options', vm.$options);
      var Ctor = vm.$options.components[tag]; //组件的构造函数
      // 创建一个组件的虚拟节点

      console.log('createComponentVnod', createComponentVnode(vm, tag, data.key, data, children, Ctor));
      return createComponentVnode(vm, tag, data.key, data, children, Ctor);
    }
  } // 创建一个组件的虚拟节点

  function createComponentVnode(vm, tag, key, data, children, Ctor) {
    if (_typeof(Ctor) == 'object') {
      Ctor = vm.$options._base.extend(Ctor);
    }

    data.hook = {
      init: function init(vnode) {
        //稍后创建真实节点的时候，如果是组件则调用此方法
        var instance = vnode.componentInstance = new vnode.componentOptions.Ctor();
        instance.$mount();
      }
    };
    console.log('data----***', data, vnode(vm, tag, key, data, children, null, {
      Ctor: Ctor
    }));
    return vnode(vm, tag, key, data, children, null, {
      Ctor: Ctor
    });
  } // _v()


  function createTextVNode(vm, text) {
    // console.log('_v()---------------',vm,text);
    return vnode(vm, undefined, undefined, undefined, undefined, text);
  }

  function vnode(vm, tag, key, data, children, text, componentOptions) {
    return {
      vm: vm,
      tag: tag,
      key: key,
      data: data,
      children: children,
      text: text,
      componentOptions: componentOptions
    };
  } // 比对两个dom元素是否相同


  function isSameVnode(vnode1, vnode2) {
    return vnode1.tag === vnode2.tag && vnode1.key === vnode2.key;
  }

  function createComponent(vnode) {
    var i = vnode.data;

    if ((i = i.hook) && (i = i.init)) {
      i(vnode); //初始化组件 
    } // 说明是组件


    if (vnode.componentInstance) {
      return true;
    }
  } // 创建真实DOM元素


  function createElm(vnode) {
    var tag = vnode.tag,
        data = vnode.data,
        text = vnode.text,
        children = vnode.children;

    if (typeof tag === 'string') {
      if (createComponent(vnode)) {
        return vnode.componentInstance.$el;
      }

      vnode.el = document.createElement(tag);
      patchProps(vnode.el, {}, data);
      children.forEach(function (child) {
        vnode.el.appendChild(createElm(child));
      });
    } else {
      vnode.el = document.createTextNode(text);
    }

    return vnode.el;
  } // 更新属性

  function patchProps(el) {
    var oldprops = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var props = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var oldStyle = oldprops.style || {};
    var newStyle = props.style || {}; // 如果老节点有新节点无  删除老节点的

    for (var key in oldStyle) {
      if (!newStyle[key]) {
        el.style[key] = '';
      }
    }

    for (var _key in oldprops) {
      //老的属性有  新的属性没有  删除
      if (!props[_key]) {
        el.removeAttribute(_key);
      }
    }

    for (var _key2 in props) {
      if (_key2 === 'style') {
        for (var styleName in props.style) {
          el.style[styleName] = props.style[styleName];
        }
      } else {
        el.setAttribute(_key2, props[_key2]);
      }
    }
  } // 创建真实DOM节点

  function patch(oldVNode, vnode) {
    if (!oldVNode) {
      //这就是组件的挂载
      return createElm(vnode);
    } // console.log('--------------patch初始化',oldVNode,vnode);
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
    } else {
      return patchVnode(oldVNode, vnode);
    }
  } // 更新进入这里  实现diff算法
  // 1.两个节点不是同一个节点，直接删除老的换上新的（没有对比）
  // 2.两个节点是同一个节点（判断节点tag和节点的key isSameVnode） 比较两个节点的属性是否有差异（复用老的属性，将差异属性进行更新） 
  // 3节点比较完毕开始比较儿子

  function patchVnode(oldVNode, vnode) {
    // console.log('oldVNode.data',oldVNode,oldVNode.data);
    console.log('vnode.data------', vnode, vnode.data); // 如果两个节点不一样直接用新的节点替换老的节点

    if (!isSameVnode(oldVNode, vnode)) {
      var _el = createElm(vnode);

      oldVNode.el.parentNode.replaceChild(_el, oldVNode.el);
      return _el;
    }

    var el = vnode.el = oldVNode.el; //如果便签相同直接使用老的的标签

    if (!oldVNode.tag) {
      // 代表是文本
      if (oldVNode.text !== vnode.text) {
        el.textContent = vnode.text;
      }
    } // 如果是标签相同我们比对属性


    patchProps(el, oldVNode.data, vnode.data); // 比较儿子节点

    var oldChildren = oldVNode.children || [];
    var newChildren = vnode.children || []; // 1.如果老节点和新节点的儿子节点都存在（重点 updateChildren）
    // 2.老节点儿子不存在，新节点儿子存在直接挂载
    // 3.老节点儿子存在，新节点儿子不存在，直接清空
    // debugger

    if (oldChildren.length > 0 && newChildren.length > 0) {
      // console.log('---------------1-------------');
      updateChildren(el, oldChildren, newChildren);
    } else if (newChildren.length > 0) {
      mountChildren(el, newChildren);
    } else if (oldChildren.length > 0) {
      el.innerHTML = '';
    }

    return el;
  }

  function mountChildren(el, newChildren) {
    for (var i = 0; i < newChildren.length; i++) {
      var child = createElm(newChildren[i]);
      el.appendChild(child);
    }
  }
  /**
   * 第一行代表 old 元素  第二行代表新的  头指针 尾指针
    1.头大于尾 (从左往右比对 oldStartIndex：0 newStartIndex:0)
      (a) old: a b c d    (b) old:a b c 
          new: a b c          new:a b c d

    2.尾小于头 (从右往左比对)
      (a) old: a b c d   (b)  old:  b c d
          new:   b c d        new:a b c d
      
    3.首位交叉
      (a) old： a b c d  (b) old：a b c d
          new： b c d a      new：d a b c

    4.乱序比对
      d c b a 
      a b c d
  */


  function updateChildren(el, oldChildren, newChildren) {
    // diff 算法核心  vue2采用双指针比对
    var oldStartIndex = 0;
    var newStartIndex = 0;
    var oldEndIndex = oldChildren.length - 1;
    var newEndIndex = newChildren.length - 1;
    var oldStartVnode = oldChildren[0];
    var newStartVnode = newChildren[0];
    var oldEndVnode = oldChildren[oldEndIndex];
    var newEndVnode = newChildren[newEndIndex]; // 创建旧节点 字典库  用于判断是否存在相同节点 采取复用

    function makeIndexByKey(children) {
      var map = {};
      children.forEach(function (child, index) {
        map[child.key] = index;
      });
      return map;
    }

    console.log('newStartVnode', newStartVnode);
    var map = makeIndexByKey(oldChildren); // console.log('map',map);

    while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
      if (!oldStartVnode) {
        // 当乱序复用节点后 处理复用节点变为空的情况
        // console.log('---------------2-------------');
        oldStartVnode = oldChildren[++oldStartIndex];
      } else if (!oldEndVnode) {
        // 当乱序复用节点后 处理复用节点变为空的情况
        // console.log('---------------3-------------');
        oldEndVnode = oldChildren[--oldEndIndex]; // 1.头大于尾（假装顺序比对成功）  双指针 只要一方头指针大于尾指针就结束
        // 如果两个节点相同  头指针后移（同时子节点存在接着递归比对）
      } else if (isSameVnode(oldStartVnode, newStartVnode)) {
        // console.log('---------------4-------------');
        patchVnode(oldStartVnode, newStartVnode); //如果两个节点相同则递归比较子节点

        oldStartVnode = oldChildren[++oldStartIndex];
        newStartVnode = newChildren[++newStartIndex]; // 2.尾小于头（假装顺序比对成功）  双指针 只要一方尾指针小于头指针就结束
        // 如果两个节点相同  尾指针前移（同时子节点存在接着递归比对）
      } else if (isSameVnode(oldEndVnode, newEndVnode)) {
        // console.log('---------------5-------------');
        patchVnode(oldEndVnode, newEndVnode); //如果两个节点相同则递归比较子节点

        oldEndVnode = oldChildren[--oldEndIndex];
        newEndVnode = newChildren[--newEndIndex]; // 交叉比对 老的第一个 和 新的最后一个 相同  将老的第一个 移到 老的最后一个
      } else if (isSameVnode(oldStartVnode, newEndVnode)) {
        // console.log('---------------6-------------');
        patchVnode(oldStartVnode, newEndVnode); // nextSibling 某个元素之后紧跟的元素

        el.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling);
        oldStartVnode = oldChildren[++oldStartIndex];
        newEndVnode = newChildren[--newEndIndex]; // 交叉比对 老的最后一个 和 新的第一个 相同  将老的最后一个 移到 老的第一个
      } else if (isSameVnode(oldEndVnode, newStartVnode)) {
        // console.log('---------------7-------------');
        patchVnode(oldEndVnode, newStartVnode);
        el.insertBefore(oldEndVnode.el, oldStartVnode.el);
        oldEndVnode = oldChildren[--oldEndIndex];
        newStartVnode = newChildren[++newStartIndex];
      } else {
        // console.log('---------------乱序比对-----------');
        var moveIndex = map[newStartVnode.key];

        if (moveIndex != undefined) {
          var moveVnode = oldChildren[moveIndex]; //找到对应的节点进行服用
          // 如果在老节点中找到节点 ，将节点移到当前老节点得开始节点前  

          el.insertBefore(moveVnode.el, oldStartVnode.el);
          oldChildren[moveIndex] = undefined; // 并把 老节点的值设为空 表示这个节点已经移走了

          patchVnode(moveVnode, newStartVnode); //比较属性和子节点
        } else {
          el.insertBefore(createElm(newStartVnode), oldStartVnode.el);
        }

        newStartVnode = newChildren[++newStartIndex];
      }
    } //1.头大于尾  old: a b c   new:a b c d 新的多余就插入
    //2.尾大于头 old:b c d   new:a b c d 新的多余就插入


    if (newStartIndex <= newEndIndex) {
      for (var i = newStartIndex; i <= newEndIndex; i++) {
        var childEl = createElm(newChildren[i]); // 第一种情况（从左往右比对）结束  头指针大于尾指针 则新节点最后一个+1不存在，appendChild新节点
        // 第二种情况（从右往左比对）结束 头指针小于尾指针 当前比对节点的下一个存在，进行插入

        var anchor = newChildren[newEndIndex + 1] ? newChildren[newEndIndex + 1].el : null; // anchor为 null，则将指定的节点添加到指定父节点的子节点列表的末尾。相当于appendChild

        el.insertBefore(childEl, anchor);
      }
    } // 第一种情况（从左往右比对）结束 和 第二种情况（从右往左比对）结束 老 头指针头小于尾指针


    if (oldStartIndex <= oldEndIndex) {
      for (var _i = oldStartIndex; _i <= oldEndIndex; _i++) {
        if (oldChildren[_i]) {
          // 乱序比对后  复用的老节点设为空值 
          var _childEl = oldChildren[_i].el;
          el.removeChild(_childEl);
        }
      }
    }
  }

  function initLifeCycle(Vue) {
    Vue.prototype._update = function (vnode) {
      var vm = this;
      var el = vm.$el; // 将组件第一次产生的虚拟节点保存在_vnode上

      var preVnode = vm._vnode;
      vm._vnode = vnode; // 通过判断是否是第一次渲染，如果不是 传入上次的渲染节点 进行diff算法比较

      if (preVnode) {
        vm.$el = patch(preVnode, vnode);
      } else {
        // 这里patch既有初始化方法  又有更新（vm.$el重新赋值新的节点） 
        vm.$el = patch(el, vnode);
      }
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

    console.log('-----------mountComponent-----------');

    var updateComponents = function updateComponents() {
      vm._update(vm._render()); // 更新组件渲染

    }; // debugger
    // watcher 相当于一个观察者  dep则是收集者 


    var watcher = new Watcher(vm, updateComponents, true); //true 用于标识 是一个渲染watcher

    console.log('watcher', watcher); // 2.根据虚拟DOM产生真实DOM
    // 3.插入到el元素中
  } // 生命周期钩子遍历执行

  function calHook(vm, hook) {
    // console.log('hook',hook);
    // 如果钩子函数的数组存在
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
      } // 数组更新


      ob.dep.notify();
      return result;
    };
  });

  var Observer = /*#__PURE__*/function () {
    function Observer(data) {
      _classCallCheck(this, Observer);

      // 为了让每个对象都有一个依赖收集
      this.dep = new Dep(); // 为了数组能够使用 observeArray 去观测新增的数据

      Object.defineProperty(data, '__ob__', {
        value: this,
        enumerable: false
      }); // console.log('-------',data);
      // 如果是数组就不再一个个劫持  太浪费性能了 (数组劫持的核心，就是重写数组的方法，对新增的属性进行判断和观测)

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
  }(); // 如果数组中还有数组或者对象 接着进行依赖收集


  function dependArray(value) {
    for (var i; i < value.length; i++) {
      var current = value[i];
      current.__ob__ && current.__ob__.dep.depend();

      if (Array.isArray(current)) {
        dependArray(current);
      }
    } // console.log('dependArray',value);

  } // 数据劫持  闭包 属性劫持


  function defineReactive(target, key, value) {
    // 如果值是对象再次进行劫持
    var childDep = observe(value);
    var dep = new Dep(); // console.log('-------dep-----------',dep.id,key,value);

    Object.defineProperty(target, key, {
      get: function get() {
        // 让这个属性的收集器记住当前的watcher  
        // console.log('Dep.target',Dep.target);
        if (Dep.target) {
          //注意这里只是 首次的data函数中的属性 进行的依赖收集 
          dep.depend(); // 这里是让 里面的数组和对象也进行依赖收集 为了修改时候调用更新操作

          if (childDep) {
            childDep.dep.depend(); // 如果里面还嵌套数组 也进行依赖收集

            if (Array.isArray(value)) {
              dependArray(value);
            }
          }
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


    return new Observer(data);
  }

  function initState(vm) {
    var opts = vm.$options;

    if (opts.data) {
      initData(vm);
    }

    if (opts.computed) {
      initComputed(vm);
    }

    if (opts.watch) {
      ininWatch(vm);
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
  } // watch 初始化 


  function ininWatch(vm) {
    var watch = vm.$options.watch;

    for (var key in watch) {
      // （可以是字符串 数组 对象）
      var handler = watch[key];

      if (Array.isArray(handler)) {
        for (var i = 0; i < handler.length; i++) {
          createWatcher(vm, key, handler);
        }
      } else {
        createWatcher(vm, key, handler);
      }
    }
  } // 1：watch:{name:'fn'}
  // 2：watch:{name:()=>{}}
  // 3：watch:{name:[()=>{},()=>{}]}
  // 4:vm.$watch(()=>vm.name,()=>{})


  function createWatcher(vm, key, handler) {
    // 也就是调用methods中的方法fn 例：watch:{name:'fn'}
    if (typeof handler === 'string') {
      handler = vm[handler];
    }

    return vm.$watch(key, handler);
  } // 初始化 computed函数


  function initComputed(vm) {
    var computed = vm.$options.computed;
    var watchers = vm._computedWathcers = {}; // debugger

    for (var key in computed) {
      var userDef = computed[key];
      var fn = typeof userDef == 'function' ? userDef : userDef.get; // 每个计算属性 对应一个计算watcher  默认lazy 首次不触发 视图更新操作
      // 此刻的计算watcher的get方法 就是当前计算属性的get方法

      watchers[key] = new Watcher(vm, fn, {
        lazy: true
      }); // console.log('watchers[key]',watchers[key]);

      defineComputed(vm, key, userDef);
    }
  } // 定义计算属性


  function defineComputed(target, key, userDef) {
    var setter = userDef.set || function () {};

    Object.defineProperty(target, key, {
      get: createComputedGetter(key),
      set: setter
    });
  } // 创建一个计算属性控制器 用于控制页面多次调用计算属性只执行一次
  // 计算属性根本不会去收集依赖，只会让自己的依赖属性去收集依赖


  function createComputedGetter(key) {
    return function () {
      var watcher = this._computedWathcers[key]; //获取到对应计算属性的watcher
      // console.log('createComputedGetter',watcher.dirty);

      if (watcher.dirty) {
        // 如果用户传入的数据是脏的就去执行传入的函数
        watcher.evaluate();
      } // 这里的是渲染watcher了 让计算属性记住渲染watcher 用于当值变化地时候 即调用计算watcher更新值，也调用渲染watcher更新视图


      if (Dep.target) {
        watcher.depend();
      }

      return watcher.value;
    };
  }

  function initStateMixin(Vue) {
    Vue.prototype.$nextTick = nextTick; // 创建watch 即组件自己的的watcher

    Vue.prototype.$watch = function (exprOrFn, cb) {
      new Watcher(this, exprOrFn, {
        user: true
      }, cb);
    };
  }

  function initMinx(Vue) {
    // 初始化
    Vue.prototype._init = function (options) {
      var vm = this; // this.constructor.options  是gloabAPI.js 中 定义的

      vm.$options = mergeOptions(this.constructor.options, options); // vm.$options = options;// 将选项挂载到实例上  data,create,methods...

      calHook(vm, 'beforeCreate'); // 状态初始化

      console.log('---------------initState--------------', options);
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
  } // 扩展了init 方法


  initMinx(Vue); // vm._update  vm._render

  initLifeCycle(Vue); // 全局api的实现

  initGlobalAPI(Vue); // 实现了 nextTick $watch

  initStateMixin(Vue); // -------------------为了方便观察前后的虚拟节点 ‘测试’-----------------

  return Vue;

}));
//# sourceMappingURL=vue.js.map
