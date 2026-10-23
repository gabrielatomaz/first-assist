import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

const translations = {
  en: {
    // Navigation & App Bar
    nav_dashboard: 'Dashboard',
    nav_kb: 'Knowledge Base',
    nav_fta: 'FTA Panel',
    nav_admin: 'Admin Panel',
    nav_logout: 'Logout',
    nav_login: 'Login',
    nav_profile: 'My Profile',
    nav_report: 'Report Technical Incident',
    active_event: 'Active Event',
    nav_kiosk: 'Report Incident (Kiosk Mode)',

    // Dashboard
    dash_title: 'Technical Incidents',
    dash_subtitle: 'Real-time status tracking and CSA assignments for FRC teams',
    dash_tab_active: 'Active Board',
    dash_tab_triage: 'In Triage',
    dash_all_events: 'All Events',
    dash_all_teams: 'All Teams',
    dash_all_categories: 'All Categories',
    dash_all_priorities: 'All Priorities',
    dash_all_statuses: 'All Statuses',
    dash_all_loaded: 'All active incidents loaded',
    dash_loading_more: 'Loading more incidents...',
    dash_loading: 'Loading incident board...',
    dash_empty_title: 'No Technical Incidents Reported',
    dash_empty_desc: 'There are currently no active technical incidents matching this event context.',

    // Report Technical Incident View
    report_title: 'Report Technical Incident',
    report_subtitle: 'Document issues immediately to request field support',
    field_team_number: 'Team Number',
    field_match_number: 'Match Number',
    field_category: 'Category',
    field_priority: 'Priority',
    field_description: 'Description',
    placeholder_team: 'e.g. 254 (or select below)',
    placeholder_match_select: 'Select Match...',
    placeholder_match_disabled: 'Select Team Number first...',
    placeholder_desc: 'Detailed explanation of the issue (e.g., Radio lost power on hit, CAN error on drive motor, etc.)',
    btn_submit_report: 'Submit Incident',
    btn_submitting: 'Submitting...',
    voice_rec_start: 'Record voice description',
    voice_rec_stop: 'Stop recording',
    voice_rec_active: 'Recording voice audio... Speak clearly into your microphone.',
    voice_transcribing: 'Transcribing audio...',
    voice_success: 'Incident details transcribed successfully via voice',

    // Incident Detail View
    detail_back: 'Back to Dashboard',
    detail_assignee: 'Technical Assignee',
    detail_unassigned: 'Unassigned',
    detail_btn_assign_me: 'Assign to Me',
    detail_btn_withdraw: 'Withdraw',
    detail_btn_resolve: 'Resolve Incident',
    detail_btn_reject: 'Reject Ticket',
    detail_btn_delete: 'Delete Ticket',
    detail_root_cause: 'Root Cause Analysis',
    detail_applied_fix: 'Applied Solution / Fix',
    detail_comments: 'Field Technical Notes & Activity',
    detail_ai_title: 'AI Technical Diagnostics',
    detail_ai_suggest: 'Get AI Support',
    detail_team: 'Team',
    detail_match: 'Match',
    detail_event: 'Event',
    detail_created: 'Reported',
    detail_updated: 'Last Updated',
    detail_reporter: 'Reported By',
    detail_info: 'Incident Details',
    detail_resolution: 'Resolution Details',
    label_technician: 'Technician',
    label_status: 'Status',
    triage_banner_title: 'This ticket is currently In Triage',
    triage_banner_desc: 'Review details and accept into the active board or reject.',
    btn_accept_ticket: 'Accept Ticket',
    btn_reject_ticket: 'Reject Ticket',

    // Knowledge Base
    kb_title: 'Knowledge Base',
    kb_subtitle: 'Search through resolved tickets to find proven root causes and applied fixes.',
    kb_search_placeholder: 'Type keywords (e.g. radio, fuse, breaker, CAN)...',
    kb_reopen: 'Re-open Incident',
    kb_empty: 'No technical resolutions found matching your search criteria.',

    // FTA Panel
    fta_title: 'FTA Management Console',
    fta_subtitle: 'Manage event teams, register CSAs, and monitor field assignments',
    tab_manage_teams: 'Manage Event Teams',
    tab_register_csa: 'Register CSA',
    tab_event_assignments: 'Event Assignments',
    btn_add_team: 'Add Team',
    btn_register_csa: 'Register CSA',

    // Admin Panel
    admin_title: 'System Administration',
    admin_subtitle: 'Global user management, event creation, TBA synchronization, and audit logging',
    tab_user_mgmt: 'User Management',
    tab_event_mgmt: 'Event Management',
    tab_audit: 'Audit Log',
    btn_create_user: 'Create User',
    btn_create_event: 'Create Event',
    btn_sync_tba: 'Sync from TBA',

    // Profile & Login Views
    profile_title: 'User Profile',
    profile_subtitle: 'View account details and assigned event role',
    profile_change_pass: 'Change Password',
    profile_current_pass: 'Current Password',
    profile_new_pass: 'New Password',
    profile_confirm_pass: 'Confirm New Password',
    login_title: 'FIRST Assist',
    login_subtitle: 'Technical Field Support Portal',
    login_email: 'Email Address',
    login_password: 'Password',
    login_button: 'Sign In',
    login_kiosk_btn: 'Report Incident (Kiosk Mode)',

    // Comments & AI
    comment_title: 'Field Technical Notes & Activity',
    comment_placeholder: 'Add technical notes, status update, or questions...',
    comment_btn_post: 'Post Comment',
    ai_title: 'AI Technical Diagnostics',
    ai_btn_diagnose: 'Get AI Technical Diagnostics & Fix Suggestions',

    // Modals
    public_title: 'Report Technical Incident',
    public_subtitle: 'Document your robot or field issue to notify event CSAs',
    resolve_title: 'Resolve Incident',
    resolve_subtitle: 'Document the root cause and applied fix to complete this incident log.',
    resolve_root_cause: 'Root Cause Analysis',
    resolve_applied_fix: 'Applied Solution / Fix',
    btn_submit_resolve: 'Complete & Resolve',

    // Categories
    cat_radio: 'Radio & Wireless Comms',
    cat_power: 'Robot Power Path & Battery',
    cat_can: 'CAN Bus Connection',
    cat_motor: 'Motor Controllers & Sensors',
    cat_pneumatics: 'Pneumatics & Air System',
    cat_vision: 'Vision & Coprocessors',
    cat_ds: 'Driver Station & Controls',
    cat_code: 'Robot User Code',
    cat_mechanical: 'Mechanical & Hardware',
    cat_field: 'Field & FMS Network',
    cat_other: 'Other Issues',

    // Statuses
    status_active: 'Active',
    status_pending_screening: 'In Triage',
    status_open: 'Open',
    status_assigned: 'Assigned',
    status_in_progress: 'In Progress',
    status_waiting: 'Waiting for Team',
    status_resolved: 'Resolved',
    status_closed: 'Closed',
    status_rejected: 'Rejected',

    // Priorities
    priority_low: 'Low Priority',
    priority_medium: 'Medium Priority',
    priority_high: 'High Priority',
    priority_critical: 'Critical Alert',

    // Common Buttons & Actions
    btn_save: 'Save',
    btn_cancel: 'Cancel',
    btn_close: 'Close',
    btn_confirm: 'Confirm',
    btn_edit: 'Edit',
    btn_delete: 'Delete',
    btn_refresh: 'Refresh',
    btn_search: 'Search',
    btn_clear: 'Clear',

    // Speech / Audio
    audio_speak: 'Listen (Audio)',
    audio_pt_spec: 'Portuguese Audio Localization Active'
  },
  pt: {
    // Navigation & App Bar
    nav_dashboard: 'Painel',
    nav_kb: 'Base de Conhecimento',
    nav_fta: 'Painel FTA',
    nav_admin: 'Painel Admin',
    nav_logout: 'Sair',
    nav_login: 'Entrar',
    nav_profile: 'Meu Perfil',
    nav_report: 'Reportar Incidente Técnico',
    active_event: 'Evento Ativo',
    nav_kiosk: 'Reportar Incidente (Modo Quiosque)',

    // Dashboard
    dash_title: 'Incidentes Técnicos',
    dash_subtitle: 'Rastreamento em tempo real e atribuições de CSA para equipes FRC',
    dash_tab_active: 'Quadro Ativo',
    dash_tab_triage: 'Em Triagem',
    dash_all_events: 'Todos os Eventos',
    dash_all_teams: 'Todas as Equipes',
    dash_all_categories: 'Todas as Categorias',
    dash_all_priorities: 'Todas as Prioridades',
    dash_all_statuses: 'Todos os Status',
    dash_all_loaded: 'Todos os incidentes ativos carregados',
    dash_loading_more: 'Carregando mais incidentes...',
    dash_loading: 'Carregando quadro de incidentes...',
    dash_empty_title: 'Nenhum Incidente Técnico Reportado',
    dash_empty_desc: 'Não há incidentes técnicos ativos correspondentes a este evento no momento.',

    // Report Technical Incident View
    report_title: 'Reportar Incidente Técnico',
    report_subtitle: 'Documente problemas imediatamente para solicitar suporte de campo',
    field_team_number: 'Número da Equipe',
    field_match_number: 'Número da Partida',
    field_category: 'Categoria',
    field_priority: 'Prioridade',
    field_description: 'Descrição',
    placeholder_team: 'ex: 254 (ou selecione abaixo)',
    placeholder_match_select: 'Selecione a Partida...',
    placeholder_match_disabled: 'Selecione a Equipe primeiro...',
    placeholder_desc: 'Explicação detalhada do problema (ex: Rádio perdeu energia ao colidir, erro CAN no motor de tração, etc.)',
    btn_submit_report: 'Enviar Incidente',
    btn_submitting: 'Enviando...',
    voice_rec_start: 'Gravar descrição por voz',
    voice_rec_stop: 'Parar gravação',
    voice_rec_active: 'Gravando áudio... Fale claramente ao microfone.',
    voice_transcribing: 'Transcrevendo áudio...',
    voice_success: 'Detalhes do incidente transcritos com sucesso por voz',

    // Incident Detail View
    detail_back: 'Voltar ao Painel',
    detail_assignee: 'Atribuído a',
    detail_unassigned: 'Não atribuído',
    detail_btn_assign_me: 'Assumir Atendimento',
    detail_btn_withdraw: 'Retirar Atribuição',
    detail_btn_resolve: 'Resolver Incidente',
    detail_btn_reject: 'Rejeitar Ticket',
    detail_btn_delete: 'Excluir Ticket',
    detail_root_cause: 'Análise de Causa Raiz',
    detail_applied_fix: 'Solução / Correção Aplicada',
    detail_comments: 'Notas Técnicas de Campo e Atividades',
    detail_ai_title: 'Diagnóstico Técnico IA',
    detail_ai_suggest: 'Obter Suporte IA',
    detail_team: 'Equipe',
    detail_match: 'Partida',
    detail_event: 'Evento',
    detail_created: 'Reportado em',
    detail_updated: 'Última Atualização',
    detail_reporter: 'Reportado Por',
    detail_info: 'Detalhes do Incidente',
    detail_resolution: 'Detalhes da Resolução',
    label_technician: 'Técnico',
    label_status: 'Status',
    triage_banner_title: 'Este ticket está atualmente em Triagem',
    triage_banner_desc: 'Revise os detalhes e aceite no quadro ativo ou rejeite.',
    btn_accept_ticket: 'Aceitar Ticket',
    btn_reject_ticket: 'Rejeitar Ticket',

    // Knowledge Base
    kb_title: 'Base de Conhecimento',
    kb_subtitle: 'Pesquise resoluções históricas, causas raiz e correções',
    kb_search_placeholder: 'Pesquisar por nº da equipe, categoria, palavras-chave ou detalhes...',
    kb_reopen: 'Reabrir Incidente',
    kb_empty: 'Nenhuma resolução técnica encontrada com os critérios de busca.',

    // FTA Panel
    fta_title: 'Console de Gerenciamento FTA',
    fta_subtitle: 'Gerencie equipes do evento, cadastre CSAs e monitore atribuições de campo',
    tab_manage_teams: 'Gerenciar Equipes do Evento',
    tab_register_csa: 'Cadastrar CSA',
    tab_event_assignments: 'Atribuições do Evento',
    btn_add_team: 'Adicionar Equipe',
    btn_register_csa: 'Cadastrar CSA',

    // Admin Panel
    admin_title: 'Administração do Sistema',
    admin_subtitle: 'Gerenciamento global de usuários, criação de eventos, sincronização TBA e log de auditoria',
    tab_user_mgmt: 'Gerenciamento de Usuários',
    tab_event_mgmt: 'Gerenciamento de Eventos',
    tab_audit: 'Log de Auditoria',
    btn_create_user: 'Criar Usuário',
    btn_create_event: 'Criar Evento',
    btn_sync_tba: 'Sincronizar do TBA',

    // Profile & Login Views
    profile_title: 'Perfil do Usuário',
    profile_subtitle: 'Veja os detalhes da conta e a função no evento',
    profile_change_pass: 'Alterar Senha',
    profile_current_pass: 'Senha Atual',
    profile_new_pass: 'Nova Senha',
    profile_confirm_pass: 'Confirmar Nova Senha',
    login_title: 'FIRST Assist',
    login_subtitle: 'Portal de Suporte Técnico de Campo',
    login_email: 'Endereço de E-mail',
    login_password: 'Senha',
    login_button: 'Entrar',
    login_kiosk_btn: 'Reportar Incidente (Modo Quiosque)',

    // Comments & AI
    comment_title: 'Notas Técnicas de Campo e Atividades',
    comment_placeholder: 'Adicionar notas técnicas, atualização de status ou perguntas...',
    comment_btn_post: 'Publicar Comentário',
    ai_title: 'Diagnóstico Técnico IA',
    ai_btn_diagnose: 'Obter Diagnóstico Técnico IA e Sugestões de Correção',

    // Modals
    public_title: 'Reportar Incidente Técnico',
    public_subtitle: 'Documente o problema do seu robô ou campo para notificar os CSAs',
    resolve_title: 'Resolver Incidente',
    resolve_subtitle: 'Documente a causa raiz e a solução aplicada para concluir este registro.',
    resolve_root_cause: 'Análise de Causa Raiz',
    resolve_applied_fix: 'Solução / Correção Aplicada',
    btn_submit_resolve: 'Concluir e Resolver',

    // Categories
    cat_radio: 'Radio & Wireless Comms',
    cat_power: 'Robot Power Path & Battery',
    cat_can: 'CAN Bus Connection',
    cat_motor: 'Motor Controllers & Sensors',
    cat_pneumatics: 'Pneumatics & Air System',
    cat_vision: 'Vision & Coprocessors',
    cat_ds: 'Driver Station & Controls',
    cat_code: 'Robot User Code',
    cat_mechanical: 'Mechanical & Hardware',
    cat_field: 'Field & FMS Network',
    cat_other: 'Other Issues',

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

    // Common Buttons & Actions
    btn_save: 'Save',
    btn_cancel: 'Cancel',
    btn_close: 'Close',
    btn_confirm: 'Confirm',
    btn_edit: 'Edit',
    btn_delete: 'Delete',
    btn_refresh: 'Refresh',
    btn_search: 'Search',
    btn_clear: 'Clear',

    // Speech / Audio
    audio_speak: 'Listen (Audio)',
    audio_pt_spec: 'Portuguese Audio Localization Active'
  }
};

export const useI18nStore = defineStore('i18n', () => {
  const currentLocale = ref(localStorage.getItem('first_assist_locale') || 'en');
  const showLanguageModal = ref(false);

  const locale = computed(() => currentLocale.value);

  const setLocale = (newLocale) => {
    currentLocale.value = newLocale;
    localStorage.setItem('first_assist_locale', newLocale);
  };

  const toggleLocale = () => {
    const next = currentLocale.value === 'en' ? 'pt' : 'en';
    setLocale(next);
    showLanguageModal.value = true;
  };

  const openLanguageModal = (targetLocale) => {
    if (targetLocale) {
      setLocale(targetLocale);
    }
    showLanguageModal.value = true;
  };

  const closeLanguageModal = () => {
    showLanguageModal.value = false;
  };

  const t = (key, defaultText) => {
    if (!key) return defaultText || '';
    // Static app UI text remains strictly in English at all times
    const langDict = translations['en'];
    if (langDict[key]) return langDict[key];
    if (defaultText) return defaultText;
    // Fallback: Never display raw key variable names! Convert snake_case/camelCase key to clean English title words
    return key.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/\b\w/g, c => c.toUpperCase());
  };

  return {
    currentLocale,
    locale,
    showLanguageModal,
    setLocale,
    toggleLocale,
    openLanguageModal,
    closeLanguageModal,
    t
  };
});
