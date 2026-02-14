export enum CallbackAction {
  MAIN_MENU = 'main:menu',
  DNS_MANAGEMENT = 'main:dns',
  DOMAIN_MANAGEMENT = 'main:domain',
  
  DNS_CREATE_SELECT_DOMAIN = 'dns:create:domain',
  DNS_CREATE_SELECT_TYPE = 'dns:create:type',
  DNS_SELECT_TYPE = 'dns:select:type',
  DNS_EDIT_SELECT_DOMAIN = 'dns:edit:domain',
  DNS_EDIT_SELECT_RECORD = 'dns:edit:record',
  DNS_EDIT_FIELD = 'dns:edit:field',
  DNS_SAVE = 'dns:save',
  DNS_LIST_DOMAIN = 'dns:list:domain',
  DNS_DELETE_SELECT = 'dns:delete:select',
  DNS_DELETE_CONFIRM = 'dns:delete:confirm',
  
  WIZARD_NEXT = 'wizard:next',
  WIZARD_SKIP = 'wizard:skip',
  WIZARD_SELECT_OPTION = 'wizard:option',
  WIZARD_CONFIRM = 'wizard:confirm',
  
  NAV_BACK = 'nav:back',
  NAV_CANCEL = 'nav:cancel',
  NAV_MAIN_MENU = 'nav:main',
  
  PAGE_NEXT = 'page:next',
  PAGE_PREV = 'page:prev',
}
