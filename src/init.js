import { compileToFunction } from "./compiler/index";
import { mountComponent } from "./lifecycle";
import { initState } from "./state";

export function initMinx(Vue){
  // 初始化
  Vue.prototype._init = function(options){
    const vm = this;
    
    vm.$options = options;// 将选项挂载到实例上  data,create,methods...

    // 状态初始化
    initState(vm)

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





 