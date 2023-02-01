import { mergeOptions } from "./utils";

export function initGlobalAPI(Vue){
  Vue.options = {};
  Vue.mixin = function(mixin){
    console.log('mixin',mixin);
    this.options = mergeOptions(this.options,mixin)
  }
}