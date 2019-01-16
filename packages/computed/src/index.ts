import Dep from'./dep';
import Watcher from './watcher';

// change page.data to reactive
export function defineReactive(obj: Object, key: string, val) {
  const property = Object.getOwnPropertyDescriptor(obj, key);
  const getter = property && property.get;
  const setter = property && property.set;
  const dep: Dep = new Dep(key);

  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get() {
      const value = getter ? getter.call(this) : val;
      if (Dep.target) {
        dep.depend();
      }
      return value;
    },
    set(newVal) {
      const value = getter ? getter.call(this) : val;
      if (value === newVal) {
        return;
      }
      if (setter) {
        setter.call(this, newVal);
      } else {
        val = newVal;
      }
      dep.notify();
    }
  });

  if (['[object Object]', '[object Array]'].indexOf(objToStringCall(val)) >= 0) {
    Object.keys(val)
      .forEach(subKey => defineReactive(obj[key], subKey, obj[key][subKey]))
  }
}

export function defineComputed(page: Page, parent: Object, key: string, userDef: Function) {
  page.__watchers__ = page.__watchers__ || {};
  const watcher = page.__watchers__[key] = new Watcher(page, key, userDef);
  const propertyDefinition = {
    enumerable: true,
    configurable: true,
    set: () => {},
    get() {
      Dep.target = watcher;
      if (watcher.dirty) {
        watcher.evaluate();
      }
      Dep.target = null;
      return watcher.value;
    }
  };

  Object.defineProperty(parent, key, propertyDefinition);
}

export function createReactive() {
  if (this.data) {
    Object.keys(this.data)
      .forEach(key => {
        if (key !== '__webviewId__') {
          defineReactive(this.data, key, this.data[key]);
        }
      });

    Object.keys(this.computed)
      .filter(key => !this.data.hasOwnProperty(key))
      .forEach(key => defineComputed(this, this.data, key, this.computed[key]))
  }
}

export function hookSetData() {
  const setData = this.setData;
  this.setData = (newData:object, callback:Function) => {
    // 兼容调用 setData 时 key 为路径形式的写法
    Object.keys(newData)
      .forEach(key => {
        if (key.indexOf('.') > 0 || key.indexOf('[') > 0) {
          safeSet(this.data, key, newData[key])
        }
      })

    Object.assign(this.data, newData);

    // 初始化计算属性，并收集依赖
    if (this.__watchers__) {
      Object.keys(this.__watchers__)
        .filter(currKey => this.__watchers__[currKey].dirty)
        .reduce(
          (acc, currKey) => {
            acc[currKey] = this.data[currKey];
            return acc;
          },
          newData
        );
    }
    setData.call(this, newData, callback);
  };
  // 调用一次 setData，用于初始化计算属性和依赖收集
  this.setData({});
}

export function objToStringCall<T>(param: T): string {
  return Object.prototype.toString.call(param);
}

function safeSet(obj: object, props: string, value) {
  const propsArr = props
    .replace(/\[([^\[\]]*)\]/g, '.$1.')
    .split('.')
    .filter(key => key !== '');
  const lastIdx = propsArr.length - 1;

  propsArr
    .reduce((prev, curr, idx) => {
      if (idx !== lastIdx) {
        if (['[object Object]', '[object Array]'].indexOf(objToStringCall(prev[curr])) < 0) {
          prev[curr] = {};
        }
        return prev[curr]
      }
      prev[curr] = value;
    }, obj)

  return obj;
}