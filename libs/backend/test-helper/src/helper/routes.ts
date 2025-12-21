export const API_ROUTES = {
  TIPGROUP: {
    CREATE: '/tipgroups',
    GET_ALL: '/tipgroups',
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
