export const API_ROUTES = {
  TIPGROUP: {
    CREATE: '/tipgroups',
    GET_ALL: '/tipgroups',
    SEASON: {
      GET_ALL_MATCHDAYS: (tipgroupId: number, seasonId: number) =>
        `/tipgroups/${tipgroupId}/seasons/${seasonId}/getAllMatchdays`,
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
