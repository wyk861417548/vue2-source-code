// 即使用观察者模式
// 1.我们可以给模板中的属性 增加一个收集器 dep
// 2.页面渲染的时候，我们将渲染逻辑封装在watcher中  vm._update(vm._render())
// 3.让dep记住这个watcher即可，稍后属性变化了可以找到对应的dep中存放的watcher进行重新渲染

import Dep from "./dep";

//1) 当我们创建渲染watcher的时候我们会把当前的渲染watcher放到Dep.target上
//2) 当调用_render() 会进行取值操作 走到get上

let id = 0;
class Watcher{
  constructor(vm,fn,boolean){
    this.id = id++;
    this.renderWatcher = boolean;  //true 表示是一个渲染watcher
    this.getter = fn; //
    this.deps = [];
    this.depId = new Set();
    this.get();
  }

  // 一个组件对应多个属性 重复属性不用记录
  addDep(dep){
    if(!this.depId.has(dep.id)){
      this.deps.push(dep)
      this.depId.add(dep.id)
      dep.addSub(this)
    }
  }

  get(){
    Dep.target = this;
    this.getter();
    Dep.target = null;
  }

  // 设置新值的时候才会走
  update(){
    console.log('update');
    queueWatcher(this)
  }

  run(){
    console.log('----------run------------');
    this.get();
  }
}

// （每个属性都有一个dep  watcher相当一个视图）
// 一个组件中 有多个属性（n个属性形成一个视图） n个dep对应一个watcher
// 一个属性对应着多个组件 1个dep对应着多个watcher 
// dep 和 watcher 多对多的关系


// 使用队列 防止属性多次修改 多次执行更新
let queue = [];
let has = {};
let pending = false;

function flashSchedulerQueue(){
  let flashQueue = queue.slice(0);
  queue = [];
  has = {};
  pending = false;
  flashQueue.forEach(q=>q.run())
}

function queueWatcher(watcher){
  let id = watcher.id;
  if(!has[id]){
    has[id] = true;
    queue.push(watcher);
    
    // 多次修改属性的值  只会执行一次（使用了宏任务setTimeout）
    // 不论update执行多少次 但是最终只执行一轮刷新操作
    if(!pending){
      nextTick(flashSchedulerQueue,0)
      pending =true;
    }
  }
}

let callbacks = [];
let waiting = false;
let timerFunc;

// 按照队列顺序执行回调
function flashCallback(){
  let cbs = callbacks.slice(0);
  // console.log('cbs--------',cbs);
  callbacks =[];
  waiting = false;
  cbs.forEach(cb=>cb())
}

// nextTick 不是维护了一个异步任务   而是将这个任务维护到了队列中
export function nextTick(cb){
  callbacks.push(cb);
  // console.log('cb',callbacks,cb);
  if(!waiting){
    // setTimeout(()=>{
    //   // 最后一起刷新
    //   flashCallback();
    // },0)
    timerFunc();
    waiting= true
  }
} 

// vue中的 nextTick没有直接采用某个api 而是采用优雅降级的方式
// 内部首先采用promise(ie 不兼容) MutationObserver(h5 的api)  ie专项 setImmediate


if(Promise){
  timerFunc = ()=>{
    Promise.resolve().then(flashCallback)
  }
}else if(MutationObserver){
  let observer = new MutationObserver(flashCallback)
  let textNode = document.createTextNode(1);
  observer.observe(textNode,{
    characterData:true //节点内容或节点文本的变动。
  })

  timerFunc = ()=>{
    textNode.textContent = 2;
  }
}else if(setImmediate){
  timerFunc = ()=>{
    setImmediate(flashCallback)
  }
}else{
  timerFunc = ()=>{
    setTimeout(flashCallback)
  }
}

export default Watcher;