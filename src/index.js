import { initMinx } from "./init";
import { initLifeCycle } from "./lifecycle";

// 不使用class 去创建类 是为了避免所有的方法耦合在一起
function Vue(options){
  // 初始化
  this._init(options)
}

// 扩展了init 方法
initMinx(Vue);
// 
initLifeCycle(Vue)

export default Vue;