import { compileToFunction } from "./compiler/index";
import { calHook, mountComponent } from "./lifecycle";
import { initState } from "./state";
import { mergeOptions } from "./utils";

export function initMinx(Vue){
  // 初始化
  Vue.prototype._init = function(options){
    const vm = this;

    // this.constructor.options  是gloabAPI.js 中 定义的
    vm.$options = mergeOptions(this.constructor.options,options)
    // vm.$options = options;// 将选项挂载到实例上  data,create,methods...

    calHook(vm,'beforeCreate')
    // 状态初始化
    console.log('---------------initState--------------',options);
    initState(vm)

    calHook(vm,'created')
    // 模板初始化
    if(options.el){
      vm.$mount(options.el)
    }
  }

  Vue.prototype.$mount = function(el){
    const vm = this;
    let ops = vm.$options;
    el = document.querySelector(el);
    
    // 先看有没有render函数
    if(!ops.render){
      let template;

      if(!ops.template && el){
        template = el.outerHTML;
      }else{
        template = ops.template;
      }
      
      // 去生成render函数
      if(template){
        // 对模板进行编译
        const render = compileToFunction(template)
        ops.render = render;
      }
    }

    // 组件挂载
    mountComponent(vm,el)
  }
}





 