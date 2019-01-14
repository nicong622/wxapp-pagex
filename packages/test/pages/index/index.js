const app = getApp();

app.page({
  data: {
    name: 'nicong'
  },
  computed: {
    sayHi() {
      return `hi! ${this.data.name}`
    }
  }
})