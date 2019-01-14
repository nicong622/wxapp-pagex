import Watcher from "./watcher";

let uid = 0;

export default class Dep {
  sub: Watcher[] = [];
  uid: number = ++uid;
  key: string;
  static target: Watcher;

  constructor(key:string) {
    this.key = key;
  }

  depend() {
    if (Dep.target) {
      Dep.target.addDep(this);
    }
  }

  addSub(watcher: Watcher) {
    this.sub.push(watcher);
  }

  notify() {
    this.sub.forEach(watcher => watcher.dirty = true);
  }
}