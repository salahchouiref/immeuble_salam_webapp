const fr = {
  // App
  app: {
    name: 'Elsalam Finance',
    buildingName: 'Immeuble Elsalam',
    subtitle: 'Gestion financière de l\'immeuble',
  },

  // Navigation
  nav: {
    dashboard: 'Tableau de bord',
    payments: 'Paiements',
    expenses: 'Dépenses',
    residents: 'Habitants',
    categories: 'Catégories',
    reports: 'Rapports',
    history: 'Historique',
    settings: 'Paramètres',
    guide: 'Guide',
    logout: 'Déconnexion',
  },

  // Dashboard
  dashboard: {
    title: 'Tableau de bord',
    currentBalance: 'Solde actuel',
    totalPayments: 'Total des paiements',
    totalExpenses: 'Total des dépenses',
    totalResidents: 'Habitants',
    monthlyOverview: 'Aperçu du mois',
    expectedContributions: 'Cotisations attendues',
    receivedContributions: 'Cotisations reçues',
    remainingToReceive: 'Reste à recevoir',
    monthlyExpenses: 'Dépenses du mois',
    recentExpenses: 'Dernières dépenses',
    paymentStatus: 'Statut des paiements',
    noData: 'Aucune donnée pour ce mois',
  },

  // Payments
  payments: {
    title: 'Paiements',
    addPayment: 'Ajouter un paiement',
    editPayment: 'Modifier le paiement',
    deletePayment: 'Supprimer le paiement',
    resident: 'Habitant',
    month: 'Mois',
    date: 'Date',
    amount: 'Montant',
    paymentType: 'Type de paiement',
    note: 'Note',
    cash: 'Espèces',
    bankTransfer: 'Virement bancaire',
    other: 'Autre',
    saved: 'Paiement enregistré avec succès.',
    updated: 'Paiement modifié avec succès.',
    deleted: 'Paiement supprimé avec succès.',
    deleteConfirm: 'Êtes-vous sûr de vouloir supprimer ce paiement ?',
    totalReceived: 'Total reçu',
    forMonth: 'pour le mois de',
  },

  // Expenses
  expenses: {
    title: 'Dépenses',
    addExpense: 'Ajouter une dépense',
    editExpense: 'Modifier la dépense',
    deleteExpense: 'Supprimer la dépense',
    category: 'Catégorie',
    date: 'Date',
    month: 'Mois',
    description: 'Description',
    amount: 'Montant',
    paymentMethod: 'Mode de paiement',
    note: 'Note',
    saved: 'Dépense enregistrée avec succès.',
    updated: 'Dépense modifiée avec succès.',
    deleted: 'Dépense supprimée avec succès.',
    deleteConfirm: 'Êtes-vous sûr de vouloir supprimer cette dépense ?',
    totalExpenses: 'Total des dépenses',
  },

  // Expense Categories
  categories: {
    cleaning: 'Femme de ménage',
    electricity: 'Électricité',
    water: 'Eau',
    maintenance: 'Entretien',
    repair: 'Réparation',
    elevator: 'Ascenseur',
    commonAreas: 'Parties communes',
    other: 'Autres',
  },

  // Residents
  residents: {
    title: 'Habitants',
    addResident: 'Ajouter un habitant',
    editResident: 'Modifier l\'habitant',
    deactivateResident: 'Désactiver l\'habitant',
    deleteResident: 'Supprimer l\'habitant',
    apartment: 'Appartement',
    name: 'Nom',
    phone: 'Téléphone',
    email: 'E-mail',
    status: 'Statut',
    active: 'Actif',
    inactive: 'Inactif',
    saved: 'Habitant enregistré avec succès.',
    updated: 'Habitant modifié avec succès.',
    deleted: 'Habitant supprimé avec succès.',
    activated: 'Habitant activé.',
    deactivated: 'Habitant désactivé.',
    deactivateConfirm: 'Êtes-vous sûr de vouloir désactiver cet habitant ?',
    activateConfirm: 'Êtes-vous sûr de vouloir activer cet habitant ?',
    deleteConfirm: 'Êtes-vous sûr de vouloir supprimer cet habitant ? Cette action est irréversible.',
    hasPaymentRecords: 'Cet habitant possède des paiements enregistrés. Désactivez-le à la place de le supprimer.',
  },

  // Payment Status
  paymentStatus: {
    paid: 'Payé',
    partial: 'Partiellement payé',
    notPaid: 'Non payé',
    expected: 'Attendu',
    paidAmount: 'Payé',
    remaining: 'Reste',
  },

  // Reports
  reports: {
    title: 'Rapports',
    monthlyReport: 'Rapport mensuel',
    selectMonth: 'Sélectionner le mois',
    entries: 'Entrées',
    exits: 'Sorties',
    monthlyBalance: 'Solde du mois',
    expected: 'Attendues',
    received: 'Reçues',
    paymentsCount: 'paiements reçus',
    residentsSummary: 'Résumé des habitants',
    paid: 'payés',
    partial: 'partiels',
    notPaid: 'non payés',
    print: 'Imprimer',
    exportPdf: 'Exporter PDF',
    exportCsv: 'Exporter CSV',
  },

  // History
  history: {
    title: 'Historique',
    filter: 'Filtrer',
    allTypes: 'Tous les types',
    payment: 'Paiement',
    expense: 'Dépense',
    from: 'Du',
    to: 'Au',
    noRecords: 'Aucun enregistrement trouvé.',
  },

  // Settings
  settings: {
    title: 'Paramètres',
    building: 'Immeuble',
    buildingName: 'Nom de l\'immeuble',
    address: 'Adresse',
    city: 'Ville',
    financial: 'Finances',
    monthlyContribution: 'Cotisation mensuelle',
    currency: 'Devise',
    account: 'Compte',
    changePassword: 'Changer le mot de passe',
    currentPassword: 'Mot de passe actuel',
    newPassword: 'Nouveau mot de passe',
    confirmPassword: 'Confirmer le mot de passe',
    saved: 'Paramètres enregistrés avec succès.',
    passwordChanged: 'Mot de passe modifié avec succès.',
  },

  // Guide
  guide: {
    title: 'Guide d\'utilisation',
    forAdmin: 'Pour l\'administrateur',
    forResident: 'Pour l\'habitant',
    addPaymentGuide: {
      title: 'Ajouter un paiement',
      steps: [
        'Ouvrez la page Paiements.',
        'Cliquez sur Ajouter un paiement.',
        'Choisissez l\'habitant.',
        'Choisissez le mois.',
        'Saisissez le montant.',
        'Enregistrez.',
      ],
    },
    addExpenseGuide: {
      title: 'Ajouter une dépense',
      steps: [
        'Ouvrez la page Dépenses.',
        'Cliquez sur Ajouter une dépense.',
        'Choisissez la catégorie.',
        'Saisissez la description.',
        'Saisissez le montant.',
        'Enregistrez.',
      ],
    },
    viewDashboard: {
      title: 'Consulter le tableau de bord',
      steps: [
        'Le tableau de bord affiche automatiquement le solde.',
        'Les cotisations reçues et restantes.',
        'Les dépenses du mois.',
        'Le statut de chaque habitant.',
      ],
    },
    viewReports: {
      title: 'Consulter les rapports',
      steps: [
        'Ouvrez la page Rapports.',
        'Sélectionnez le mois souhaité.',
        'Le rapport se génère automatiquement.',
        'Vous pouvez imprimer ou exporter.',
      ],
    },
  },

  // Auth
  auth: {
    login: 'Connexion',
    email: 'Adresse e-mail',
    password: 'Mot de passe',
    signIn: 'Se connecter',
    forgotPassword: 'Mot de passe oublié ?',
    logout: 'Déconnexion',
    logoutConfirm: 'Voulez-vous vraiment vous déconnecter ?',
    invalidCredentials: 'E-mail ou mot de passe incorrect.',
    sessionExpired: 'Votre session a expiré. Veuillez vous reconnecter.',
    tooManyAttempts: 'Trop de tentatives de connexion. Réessayez dans quelques minutes.',
    maxSessions: 'Le nombre maximum de sessions actives est atteint. Déconnectez-vous sur un autre appareil.',
  },

  // Roles
  roles: {
    admin: 'Administrateur',
    resident: 'Habitant',
    readOnly: 'Lecture seule',
  },

  // Common
  common: {
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    add: 'Ajouter',
    search: 'Rechercher',
    filter: 'Filtrer',
    close: 'Fermer',
    confirm: 'Confirmer',
    loading: 'Chargement...',
    error: 'Une erreur est survenue.',
    success: 'Opération réussie.',
    saved: 'Enregistré avec succès.',
    updated: 'Modifié avec succès.',
    noPermission: 'Vous n\'avez pas l\'autorisation d\'effectuer cette opération.',
    networkError: 'Connexion impossible. Vérifiez votre connexion Internet puis réessayez.',
    required: 'Ce champ est requis.',
    invalidAmount: 'Le montant doit être supérieur à 0.',
    all: 'Tous',
    from: 'Du',
    to: 'Au',
    selectMonth: 'Sélectionner le mois',
    yes: 'Oui',
    no: 'Non',
    online: 'En ligne',
    offline: 'Hors ligne',
    offlineMessage: 'Vous êtes hors ligne. Veuillez vous reconnecter pour modifier les données.',
    empty: 'Aucune donnée',
    emptyPayments: 'Aucun paiement enregistré.',
    emptyExpenses: 'Aucune dépense enregistrée.',
  },

  // Validation
  validation: {
    required: 'Ce champ est requis.',
    email: 'Adresse e-mail invalide.',
    minLength: 'Minimum {min} caractères.',
    passwordMatch: 'Les mots de passe ne correspondent pas.',
    positiveAmount: 'Le montant doit être supérieur à 0.',
  },

  // Time
  months: {
    january: 'Janvier',
    february: 'Février',
    march: 'Mars',
    april: 'Avril',
    may: 'Mai',
    june: 'Juin',
    july: 'Juillet',
    august: 'Août',
    september: 'Septembre',
    october: 'Octobre',
    november: 'Novembre',
    december: 'Décembre',
  },

  // Demo
  demo: {
    warning: 'DONNÉES DE DÉMO',
    explanation: 'Ceci sont des données fictives à des fins de démonstration.',
  },
};

export default fr;
