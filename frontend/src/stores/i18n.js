import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

const translations = {
  en: {
    // Nav
    nav_dashboard: 'Dashboard',
    nav_kb: 'Knowledge Base',
    nav_fta: 'FTA Panel',
    nav_admin: 'Admin Panel',
    nav_logout: 'Logout',
    nav_report: 'Report Technical Incident',
    active_event: 'Active Event',

    // Dashboard
    dash_title: 'Technical Incidents',
    dash_subtitle: 'Real-time status tracking and CSA assignments for FRC teams',
    dash_tab_active: 'Active Board',
    dash_tab_triage: 'In Triage',
    dash_all_events: 'All Events',
    dash_all_teams: 'All Teams',
    dash_all_priorities: 'All Priorities',
    dash_all_loaded: 'All active incidents loaded',
    dash_loading_more: 'Loading more incidents...',
    dash_loading: 'Loading incident board...',
    dash_empty_title: 'No Technical Incidents Reported',
    dash_empty_desc: 'There are currently no active technical incidents matching this event context.',

    // Statuses
    status_active: 'Active',
    status_pending_screening: 'In Triage',
    status_open: 'Open',
    status_assigned: 'Assigned',
    status_in_progress: 'In Progress',
    status_waiting: 'Waiting',
    status_resolved: 'Resolved',
    status_closed: 'Closed',
    status_rejected: 'Rejected',

    // Priorities
    priority_low: 'Low',
    priority_medium: 'Medium',
    priority_high: 'High',
    priority_critical: 'Critical',

    // Speech / Audio
    audio_speak: 'Listen (Audio)',
    audio_pt_spec: 'Portuguese Audio Localization Active'
  },
  pt: {
    // Nav
    nav_dashboard: 'Painel',
    nav_kb: 'Base de Conhecimento',
    nav_fta: 'Painel FTA',
    nav_admin: 'Painel Admin',
    nav_logout: 'Sair',
    nav_report: 'Reportar Incidente Técnico',
    active_event: 'Evento Ativo',

    // Dashboard
    dash_title: 'Incidentes Técnicos',
    dash_subtitle: 'Rastreamento em tempo real e atribuições de CSA para equipes FRC',
    dash_tab_active: 'Quadro Ativo',
    dash_tab_triage: 'Em Triagem',
    dash_all_events: 'Todos os Eventos',
    dash_all_teams: 'Todas as Equipes',
    dash_all_priorities: 'Todas as Prioridades',
    dash_all_loaded: 'Todos os incidentes ativos carregados',
    dash_loading_more: 'Carregando mais incidentes...',
    dash_loading: 'Carregando quadro de incidentes...',
    dash_empty_title: 'Nenhum Incidente Técnico Reportado',
    dash_empty_desc: 'Não há incidentes técnicos ativos correspondentes a este evento no momento.',

    // Statuses
    status_active: 'Ativos',
    status_pending_screening: 'Em Triagem',
    status_open: 'Aberto',
    status_assigned: 'Atribuído',
    status_in_progress: 'Em Progresso',
    status_waiting: 'Aguardando',
    status_resolved: 'Resolvido',
    status_closed: 'Fechado',
    status_rejected: 'Rejeitado',

    // Priorities
    priority_low: 'Baixa',
    priority_medium: 'Média',
    priority_high: 'Alta',
    priority_critical: 'Crítica',

    // Speech / Audio
    audio_speak: 'Ouvir (Áudio)',
    audio_pt_spec: 'Localização de Áudio em Português Ativa'
  }
};

export const useI18nStore = defineStore('i18n', () => {
  const currentLocale = ref(localStorage.getItem('first_assist_locale') || 'en');

  const locale = computed(() => currentLocale.value);

  const setLocale = (newLocale) => {
    currentLocale.value = newLocale;
    localStorage.setItem('first_assist_locale', newLocale);
  };

  const toggleLocale = () => {
    const next = currentLocale.value === 'en' ? 'pt' : 'en';
    setLocale(next);
  };

  const t = (key) => {
    const langDict = translations[currentLocale.value] || translations['en'];
    return langDict[key] || translations['en'][key] || key;
  };

  return {
    currentLocale,
    locale,
    setLocale,
    toggleLocale,
    t
  };
});
