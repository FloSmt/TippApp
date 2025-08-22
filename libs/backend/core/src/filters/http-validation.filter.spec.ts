import { ArgumentsHost, BadRequestException } from '@nestjs/common';
import { HttpValidationFilter } from './http-validation.filter';

describe('HttpValidationFilter', () => {
  let filter: HttpValidationFilter;
  let mockResponse: any;
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    filter = new HttpValidationFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
      }),
    } as any;
  });

  it('should return validation messages when exception response contains message array', () => {
    const exception = new BadRequestException([
      {
        property: 'email',
        constraints: { isEmail: 'email must be an email' },
      },
    ]);
    // Patch getResponse to simulate NestJS behavior
    jest.spyOn(exception, 'getResponse').mockReturnValue({
      message: [
        {
          property: 'email',
          constraints: { isEmail: 'email must be an email' },
        },
      ],
    });

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(422);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 422,
      message: 'Validation failed.',
      validationMessages: [
        {
          property: 'email',
          constraints: { isEmail: 'email must be an email' },
        },
      ],
    });
  });

  it('should return empty validationMessages if message is not an array', () => {
    const exception = new BadRequestException('Some error');
    jest.spyOn(exception, 'getResponse').mockReturnValue({
      message: 'Some error',
    });

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(422);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 422,
      message: 'Validation failed.',
      validationMessages: [],
    });
  });

  it('should return empty validationMessages if exception response is not an object', () => {
    const exception = new BadRequestException('Some error');
    jest.spyOn(exception, 'getResponse').mockReturnValue('Some error');

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(422);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 422,
      message: 'Validation failed.',
      validationMessages: [],
    });
  });
});
