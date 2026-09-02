import {
  DashboardView,
  IncidentCreateView,
  LoginView,
  UserManagementView,
  ProfileView,
  IncidentDetailView,
  KnowledgeBaseView,
  TeamProfileView,
  AdminDashboardView,
  FTADashboardView
} from '../views';

export default [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { guest: true }
  },
  {
    path: '/',
    name: 'dashboard',
    component: DashboardView,
    meta: { requiresAuth: true }
  },
  {
    path: '/create',
    name: 'create',
    component: IncidentCreateView,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
    meta: { requiresAuth: true }
  },
  {
    path: '/users',
    name: 'users',
    component: UserManagementView,
    meta: { requiresAuth: true, roles: ['ADMIN', 'FTA'] }
  },
  {
    path: '/incidents/:id',
    name: 'incident-detail',
    component: IncidentDetailView,
    meta: { requiresAuth: true }
  },
  {
    path: '/knowledge-base',
    name: 'knowledge-base',
    component: KnowledgeBaseView,
    meta: { requiresAuth: true }
  },
  {
    path: '/teams/:number',
    name: 'team-profile',
    component: TeamProfileView,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'admin-dashboard',
    component: AdminDashboardView,
    meta: { requiresAuth: true, roles: ['ADMIN'] }
  },
  {
    path: '/fta',
    name: 'fta-dashboard',
    component: FTADashboardView,
    meta: { requiresAuth: true, roles: ['ADMIN', 'FTA'] }
  }
];
