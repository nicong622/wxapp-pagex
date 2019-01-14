declare class Page {
  constructor(options: object)
  setData(data: object, callback?: Function): void
  __watchers__?: object
}

declare interface pageOptions {
  data?: object
  mixins?: Array<object>
  computed?: object
}