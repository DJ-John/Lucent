/// <reference types="vite/client" />

import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const viewModules = import.meta.glob('../views/**/*.vue')

type LazyView = () => Promise<unknown>

const toKebabCase = (value: string): string =>
  value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase()

const toRouteSegment = (segment: string, isLast: boolean): string => {
  if (/^\[\.\.\..+\]$/.test(segment)) {
    const param = segment.slice(4, -1)
    return `:${param}(.*)*`
  }

  if (/^\[.+\]$/.test(segment)) {
    return `:${segment.slice(1, -1)}`
  }

  const cleaned = segment.replace(/View$/, '')
  const kebab = toKebabCase(cleaned)

  if (isLast && (kebab === 'index' || kebab === 'home')) {
    return ''
  }

  return kebab
}

const normalizeRouteName = (path: string): string => {
  if (path === '/') {
    return 'home'
  }

  return path
    .slice(1)
    .replace(/\//g, '-')
    .replace(/[:()*.]/g, '')
    .replace(/-+/g, '-')
}

const toRoutePath = (filePath: string): string => {
  const relativePath = filePath.replace(/^\.\.\/views\//, '').replace(/\.vue$/, '')
  const rawSegments = relativePath.split('/').filter(Boolean)

  const routeSegments = rawSegments
    .map((segment, index) => toRouteSegment(segment, index === rawSegments.length - 1))
    .filter(Boolean)

  return routeSegments.length ? `/${routeSegments.join('/')}` : '/'
}

const countDynamicSegments = (path: string): number =>
  path.split('/').filter((segment) => segment.startsWith(':')).length

const buildRoutes = (): RouteRecordRaw[] => {
  const routesByPath = new Map<string, RouteRecordRaw>()

  Object.entries(viewModules).forEach(([filePath, moduleLoader]) => {
    const path = toRoutePath(filePath)

    if (!routesByPath.has(path)) {
      routesByPath.set(path, {
        path,
        name: normalizeRouteName(path),
        component: moduleLoader as LazyView,
      })
    }
  })

  return Array.from(routesByPath.values()).sort((a, b) => {
    const aPath = a.path as string
    const bPath = b.path as string

    const dynamicDiff = countDynamicSegments(aPath) - countDynamicSegments(bPath)
    if (dynamicDiff !== 0) {
      return dynamicDiff
    }

    const lengthDiff = aPath.split('/').length - bPath.split('/').length
    if (lengthDiff !== 0) {
      return lengthDiff
    }

    return aPath.localeCompare(bPath)
  })
}

const router = createRouter({
  history: createWebHistory(),
  routes: buildRoutes(),
})

export default router

