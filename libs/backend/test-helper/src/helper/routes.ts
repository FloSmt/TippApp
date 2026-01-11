export const API_ROUTES = {
  TIPGROUP: {
    CREATE: '/tipgroups',
    GET_ALL: '/tipgroups',
    GET_DETAILS: (tipgroupId: number) => `/tipgroups/${tipgroupId}`,
    SEASON: {
      GET_ALL_MATCHDAYS: (tipgroupId: number, seasonId: number) =>
        `/tipgroups/${tipgroupId}/seasons/${seasonId}/getAllMatchdays`,
      GET_CURRENT_MATCHDAY: (tipgroupId: number, seasonId: number) =>
        `/tipgroups/${tipgroupId}/seasons/${seasonId}/getCurrentMatchday`,
    },
    MATCHDAY: {
      GET_DETAILS: (tipgroupId: number, seasonId: number, matchdayId: number) =>
        `/tipgroups/${tipgroupId}/seasons/${seasonId}/matchdays/${matchdayId}`,
    },
  },
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
  },
};
