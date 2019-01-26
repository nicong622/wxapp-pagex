# 像 Vuejs 一样在小程序中使用计算属性

## how to use

### install mp-computed

`npm i mp-computed`

### use in your page.js

in your page's js file
```js
const { createReactive } = require('mp-computed')

Page({
  onLoad() {
    createReactive.call(this)
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
```

in your page's wxml file
```xml
<view>{{sayHi}}</view>

<button bindtap="changeName">change name</button>
```
