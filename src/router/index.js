import Layout from '@/layout/content'
import { createRouter, createWebHashHistory } from "vue-router"

export const routes = [
  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },

  {
    path: '/login',
    component: () => import('@/views/login'),
    hidden: true
  },

  {
    path: '/contest-screen',
    component: () => import('@/views/contest-screen'),
    meta: { title: '比赛大屏' },
    hidden: true
  },

  {
    path: '/',
    component: Layout,
    meta: { title: 'CTF平台管理', icon: 'icon-apps' },
    children: [{
      name: 'dashboard',
      path: '/dashboard',
      component: () => import('@/views/dashboard'),
      meta: { title: '仪表盘' }
    }, {
      name: 'challenges',
      path: '/challenges',
      component: () => import('@/views/challenges'),
      meta: { title: '赛题管理' }
    }, {
      name: 'containers',
      path: '/containers',
      component: () => import('@/views/containers'),
      meta: { title: '镜像管理' }
    }, {
      name: 'users',
      path: '/users',
      component: () => import('@/views/users'),
      meta: { title: '用户管理' }
    }, {
      name: 'teams',
      path: '/teams',
      component: () => import('@/views/teams'),
      meta: { title: '队伍管理' }
    }, {
      name: 'contests',
      path: '/contests',
      component: () => import('@/views/contests'),
      meta: { title: '比赛管理' }
    }, {
      name: 'submissions',
      path: '/submissions',
      component: () => import('@/views/submissions'),
      meta: { title: '提交记录' }
    }, {
      name: 'announcements',
      path: '/announcements',
      component: () => import('@/views/announcements'),
      meta: { title: '公告管理' }
    }]
  },

  {
    path: '/vuln-range',
    component: Layout,
    meta: { title: '漏洞靶场', icon: 'icon-bug' },
    children: [{
      name: 'vuln-targets',
      path: '/vuln-targets',
      component: () => import('@/views/vuln-range/targets'),
      meta: { title: '靶机管理' }
    }, {
      name: 'vuln-environments',
      path: '/vuln-environments',
      component: () => import('@/views/vuln-range/environments'),
      meta: { title: '环境管理' }
    }, {
      name: 'vuln-scenarios',
      path: '/vuln-scenarios',
      component: () => import('@/views/vuln-range/scenarios'),
      meta: { title: '场景管理' }
    }, {
      name: 'vuln-analysis',
      path: '/vuln-analysis',
      component: () => import('@/views/vuln-range/analysis'),
      meta: { title: '漏洞分析' }
    }, {
      name: 'vuln-monitoring',
      path: '/vuln-monitoring',
      component: () => import('@/views/vuln-range/monitoring'),
      meta: { title: '监控中心' }
    }]
  },

  {
    path: '/awd',
    component: Layout,
    meta: { title: 'AWD攻防', icon: 'icon-sword' },
    children: [{
      name: 'awd-contests',
      path: '/awd-contests',
      component: () => import('@/views/awd/contests'),
      meta: { title: 'AWD比赛' }
    }, {
      name: 'awd-targets',
      path: '/awd-targets',
      component: () => import('@/views/awd/targets'),
      meta: { title: '靶机配置' }
    }, {
      name: 'awd-attacks',
      path: '/awd-attacks',
      component: () => import('@/views/awd/attacks'),
      meta: { title: '攻击记录' }
    }, {
      name: 'awd-defenses',
      path: '/awd-defenses',
      component: () => import('@/views/awd/defenses'),
      meta: { title: '防御状态' }
    }]
  },

  {
    path: '/system',
    component: Layout,
    meta: { title: '系统管理', icon: 'icon-settings' },
    children: [{
      name: 'logs',
      path: '/logs',
      component: () => import('@/views/system/logs'),
      meta: { title: '系统日志' }
    }, {
      name: 'settings',
      path: '/settings',
      component: () => import('@/views/system/settings'),
      meta: { title: '系统设置' }
    }]
  },

  {
    path: '/:catchAll(.*)',
    redirect: '/404',
    hidden: true
  }
]

const buildRouter = () => createRouter({
  history: createWebHashHistory(),
  routes
})

const router = buildRouter()

export default router
