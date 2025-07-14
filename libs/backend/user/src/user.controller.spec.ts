import { Test, TestingModule } from '@nestjs/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Tipgroup } from '@tippapp/backend/database';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;
  let userService: DeepMocked<UserService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        {
          provide: UserService,
          useValue: createMock<UserService>(),
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return tipgroups of the user', async () => {
    const tipgroup1 = new Tipgroup();
    tipgroup1.id = 101;
    tipgroup1.name = 'Group1';

    const tipgroup2 = new Tipgroup();
    tipgroup2.id = 102;
    tipgroup2.name = 'Group2';

    const req = { user: { id: 1 } };

    userService.getTipGroupsByUserId.mockResolvedValue([tipgroup1, tipgroup2]);
    const result = await controller.getTipgroups(req);

    expect(userService.getTipGroupsByUserId).toHaveBeenCalledTimes(1);
    expect(userService.getTipGroupsByUserId).toHaveBeenCalledWith(req.user.id);
    expect(result).toEqual([
      { name: tipgroup1.name, id: tipgroup1.id },
      { name: tipgroup2.name, id: tipgroup2.id },
    ]);
  });
});
