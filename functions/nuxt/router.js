import Vue from 'vue'
import Router from 'vue-router'
import { interopDefault } from './utils'
import scrollBehavior from './router.scrollBehavior.js'

const _c09dd3cc = () => interopDefault(import('../pages/draw.vue' /* webpackChunkName: "pages/draw" */))
const _7112cd6f = () => interopDefault(import('../pages/gallery/index.vue' /* webpackChunkName: "pages/gallery/index" */))
const _4847a1c5 = () => interopDefault(import('../pages/gallery/section/index.vue' /* webpackChunkName: "pages/gallery/section/index" */))
const _03255d26 = () => interopDefault(import('../pages/gallery/section/_id.vue' /* webpackChunkName: "pages/gallery/section/_id" */))
const _54835f97 = () => interopDefault(import('../pages/gallery/_id.vue' /* webpackChunkName: "pages/gallery/_id" */))
const _2030b1ec = () => interopDefault(import('../pages/index.vue' /* webpackChunkName: "pages/index" */))

// TODO: remove in Nuxt 3
const emptyFn = () => {}
const originalPush = Router.prototype.push
Router.prototype.push = function push (location, onComplete = emptyFn, onAbort) {
  return originalPush.call(this, location, onComplete, onAbort)
}

Vue.use(Router)

export const routerOptions = {
  mode: 'history',
  base: decodeURI('/'),
  linkActiveClass: 'nuxt-link-active',
  linkExactActiveClass: 'nuxt-link-exact-active',
  scrollBehavior,

  routes: [{
    path: "/draw",
    component: _c09dd3cc,
    name: "draw"
  }, {
    path: "/gallery",
    component: _7112cd6f,
    name: "gallery"
  }, {
    path: "/gallery/section",
    component: _4847a1c5,
    name: "gallery-section"
  }, {
    path: "/gallery/section/:id",
    component: _03255d26,
    name: "gallery-section-id"
  }, {
    path: "/gallery/:id",
    component: _54835f97,
    name: "gallery-id"
  }, {
    path: "/",
    component: _2030b1ec,
    name: "index"
  }],

  fallback: false
}

export function createRouter () {
  return new Router(routerOptions)
}
