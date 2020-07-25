export { default as Canvas } from '../../components/Canvas.vue'
export { default as CanvasMeta } from '../../components/CanvasMeta.vue'
export { default as CustomCursor } from '../../components/CustomCursor.vue'
export { default as Display } from '../../components/Display.vue'
export { default as DownloadButton } from '../../components/DownloadButton.vue'
export { default as Draw } from '../../components/Draw.vue'
export { default as Drawing } from '../../components/Drawing.vue'
export { default as FirestoreAdminTools } from '../../components/FirestoreAdminTools.vue'
export { default as Help } from '../../components/Help.vue'
export { default as LikeButton } from '../../components/LikeButton.vue'
export { default as Log } from '../../components/Log.vue'
export { default as Nav } from '../../components/Nav.vue'
export { default as NavMenu } from '../../components/NavMenu.vue'
export { default as PickSection } from '../../components/PickSection.vue'
export { default as PrevNext } from '../../components/PrevNext.vue'
export { default as SaveModal } from '../../components/SaveModal.vue'
export { default as ToolBar } from '../../components/ToolBar.vue'

export const LazyCanvas = import('../../components/Canvas.vue' /* webpackChunkName: "components/Canvas'}" */).then(c => c.default || c)
export const LazyCanvasMeta = import('../../components/CanvasMeta.vue' /* webpackChunkName: "components/CanvasMeta'}" */).then(c => c.default || c)
export const LazyCustomCursor = import('../../components/CustomCursor.vue' /* webpackChunkName: "components/CustomCursor'}" */).then(c => c.default || c)
export const LazyDisplay = import('../../components/Display.vue' /* webpackChunkName: "components/Display'}" */).then(c => c.default || c)
export const LazyDownloadButton = import('../../components/DownloadButton.vue' /* webpackChunkName: "components/DownloadButton'}" */).then(c => c.default || c)
export const LazyDraw = import('../../components/Draw.vue' /* webpackChunkName: "components/Draw'}" */).then(c => c.default || c)
export const LazyDrawing = import('../../components/Drawing.vue' /* webpackChunkName: "components/Drawing'}" */).then(c => c.default || c)
export const LazyFirestoreAdminTools = import('../../components/FirestoreAdminTools.vue' /* webpackChunkName: "components/FirestoreAdminTools'}" */).then(c => c.default || c)
export const LazyHelp = import('../../components/Help.vue' /* webpackChunkName: "components/Help'}" */).then(c => c.default || c)
export const LazyLikeButton = import('../../components/LikeButton.vue' /* webpackChunkName: "components/LikeButton'}" */).then(c => c.default || c)
export const LazyLog = import('../../components/Log.vue' /* webpackChunkName: "components/Log'}" */).then(c => c.default || c)
export const LazyNav = import('../../components/Nav.vue' /* webpackChunkName: "components/Nav'}" */).then(c => c.default || c)
export const LazyNavMenu = import('../../components/NavMenu.vue' /* webpackChunkName: "components/NavMenu'}" */).then(c => c.default || c)
export const LazyPickSection = import('../../components/PickSection.vue' /* webpackChunkName: "components/PickSection'}" */).then(c => c.default || c)
export const LazyPrevNext = import('../../components/PrevNext.vue' /* webpackChunkName: "components/PrevNext'}" */).then(c => c.default || c)
export const LazySaveModal = import('../../components/SaveModal.vue' /* webpackChunkName: "components/SaveModal'}" */).then(c => c.default || c)
export const LazyToolBar = import('../../components/ToolBar.vue' /* webpackChunkName: "components/ToolBar'}" */).then(c => c.default || c)
