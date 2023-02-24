import { mergeOptions } from "./utils";

export function initGlobalAPI(Vue){
  // 静态方法
  Vue.options = {
    _base:Vue
  };
  Vue.mixin = function(mixin){
    // console.log('mixin----------',mixin);
    this.options = mergeOptions(this.options,mixin)
  }


  Vue.extend = function(options){
    //使用组合继承 
    function Sub(options= {}){
      // debugger
      this._init(options);  //默认对子类进行初始化操作
    }

    Sub.prototype = Object.create(Vue.prototype)
    Sub.prototype.constructor = Sub
    // debugger

    // 自己options中components[key](每一个组件)的和全局（Vue.options）的components[key]（每一个组件）建立一个联系（prototype联系）
    // 通过components查找如果自己有使用自己的，如果没有去原型上找找到使用全局的
    Sub.options = mergeOptions(Vue.options,options);
    return Sub;
  }

  Vue.options.components = {};
  Vue.component = function(id,definition){

    // 如果definition已经是一个函数了，那么说明用户自己调用了Vue.extend
    // debugger
    definition = typeof definition === 'function'?definition:Vue.extend(definition)

    Vue.options.components[id] = definition;
  }
}