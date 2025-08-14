export interface ApiErrorDetail {
  code: string;
  message: string;
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
      message: 'Benutzer nicht gefunden.',
    },
    USERNAME_TAKEN: {
      code: 'USER.USERNAME_TAKEN',
      message: 'Dieser Benutzername ist bereits vergeben.',
    },
  };
}
