export interface ApiErrorDetail {
  code: string;
  message: string;
}

export interface ApiValidationErrorMessage {
  property: string;
  constraints: { [key: string]: string };
}

export abstract class ErrorCodes {
  protected abstract readonly prefix: string;

  public getFullCode(errorDetail: ApiErrorDetail): string {
    return `${this.prefix}.${errorDetail.code}`;
  }

  public static readonly Auth = {
    EMAIL_ALREADY_EXISTS: {
      code: 'AUTH.EMAIL_ALREADY_EXISTS',
      message: 'email address already exists.',
    },
    USER_NOT_FOUND: {
      code: 'AUTH.USER_NOT_FOUND',
      message: 'User not found.',
    },
    INVALID_CREDENTIALS: {
      code: 'AUTH.INVALID_CREDENTIALS',
      message: 'invalid credentials provided.',
    },
    INVALID_REFRESH_TOKEN: {
      code: 'AUTH.INVALID_REFRESH_TOKEN',
      message: 'invalid refresh token provided.',
    },
  };

  public static readonly User = {
    USER_NOT_FOUND: {
      code: 'USER.USER_NOT_FOUND',
      message: 'User not found.',
    },
    USERNAME_TAKEN: {
      code: 'USER.USERNAME_TAKEN',
      message: 'The username is already taken.',
    },
  };

  public static readonly CreateTipgroup = {
    TIPGROUP_NAME_TAKEN: {
      code: 'CREATE_TIPGROUP.TIPGROUP_NAME_TAKEN',
      message: 'The matchday name is already taken.',
    },
    LEAGUE_NOT_FOUND: {
      code: 'CREATE_TIPGROUP.LEAGUE_NOT_FOUND',
      message: 'The referenced league was not found.',
    },
    API_DATA_UNAVAILABLE: {
      code: 'CREATE_TIPGROUP.API_DATA_UNAVAILABLE',
      message: 'External API data is currently unavailable.',
    },
  };

  public static readonly Tipgroup = {
    MATCHDAY_DETAILS_NOT_FOUND: {
      code: 'TIPGROUP.MATCHDAY_DETAILS_NOT_FOUND',
      message: 'Matchday details not found for the given parameters.',
    },
    NOT_A_MEMBER: {
      code: 'TIPGROUP.NOT_A_MEMBER',
      message: 'User is not a member of the specified tipgroup.',
    },
    SEASON_NOT_FOUND: {
      code: 'TIPGROUP.SEASON_NOT_FOUND',
      message: 'Season not found for the given parameters.',
    },
  };
}
