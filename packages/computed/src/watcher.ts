/// <reference path="../libs/page.d.ts" />

import Dep from "./dep";

export default class Watcher {
  page: Page;
  key: string;
  getter: Function;
  dirty: boolean = true;
  depIds: Set<number> = new Set();
  deps: Dep[] = [];
  value: any;

  constructor(page: Page, key: string, getter: Function) {
    this.page = page;
    this.key = key;
    this.getter = getter;
  }

  evaluate() {
    if (this.dirty) {
      this.dirty = false;
      this.value = this.getter.call(this.page);
      return this.value;
    }
  }

  addDep(dep: Dep) {
    const uid = dep.uid;
    if (!this.depIds.has(uid)) {
      this.depIds.add(uid);
      this.deps.push(dep);
      dep.addSub(this);
    }
  }
};
