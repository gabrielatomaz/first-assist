import { DashboardView, IncidentCreateView } from '../views'

export default [
  {
    path: '/',
    name: 'dashboard',
    component: DashboardView
  },
  {
    path: '/create',
    name: 'create',
    component: IncidentCreateView
  }
]
