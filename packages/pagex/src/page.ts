/// <reference path="../libs/page.d.ts" />
import { createReactive } from 'mp-computed';

// merge mixins into page's options
function mergeOptions(origin: object, mixin: object) {
  const result = Object.assign({}, origin);

  Object.keys(mixin)
    .forEach((key) => {
      const newProp = mixin[key];
      const oldProp = result[key];

      switch (Object.prototype.toString.call(newProp)) {
        case '[object Function]':
          result[key] = function(...args) {
            mixin[key].call(this, ...args);
            oldProp && (typeof oldProp === 'function') && oldProp.call(this, ...args);
          };
          break;
        case '[object Object]':
          result[key] = Object.assign({}, mixin[key], result[key]);
          break;
        default:
          result[key] = oldProp === undefined ? newProp : oldProp;
      }
    });

  return result;
}

export default class PageX {
  private static __globalMixin__: object = {};

  constructor(options: pageOptions, mergeStrategy = mergeOptions) {
    let localMixins = PageX.__globalMixin__;

    if (options.mixins && options.mixins.length) {
      localMixins = options.mixins.reduce((prev, curr) => mergeStrategy(curr, prev), localMixins);
    }

    options = mergeStrategy(options, localMixins);

    if (options.computed && Object.keys(options.computed).length) {
      options = mergeStrategy(options, {
        onLoad() {
          createReactive.call(this)
        }
      })
    }

    new Page(options);
  }

  static mixin = function(mixinProps: object) {
    PageX.__globalMixin__ = mixinProps;
  };
};

