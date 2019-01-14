/// <reference path="../libs/page.d.ts" />
import { createReactive, mergeOptions, hookSetData } from 'mp-computed';

export default class PageX {
  private static __globalMixin__:object = {};

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
          hookSetData.call(this)
        }
      })
    }

    new Page(options);
  }

  static mixin = function(mixinProps: object) {
    PageX.__globalMixin__ = mixinProps;
  };
};

