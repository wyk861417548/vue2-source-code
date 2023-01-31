let id = 0;
class Dep{
  constructor(){
    this.id = id++;
    this.subs = [];
  }

  depend(){
    // （dep 和 watcher 是多对多的关系  一个属性在多个组件中使用  dep -> 多个watcher）
    // 一个组件中有多个属性 watcher -> 多个dep

    // this.subs.push(Dep.target)
    Dep.target.addDep(this)
  }

  addSub(watcher){
    this.subs.push(watcher)
  }

  // watcher 更新
  notify(){
    this.subs.forEach(watcher=>watcher.update())
  }
}

Dep.target = null;

export default Dep;