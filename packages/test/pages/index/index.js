const { createReactive, hookSetData } = require('mp-computed')

Page({
  onLoad() {
    createReactive.call(this)
    hookSetData.call(this)
  },
  data: {
    name: 'stranger'
  },
  computed: {
    sayHi() {
      return `hello! ${this.data.name}`
    }
  },
  changeName() {
    this.setData({ name: 'nicong622' })
  }
})