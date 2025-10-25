import * as bcrypt from 'bcrypt';
import { HashService } from './hash.service';

describe('HashService', () => {
  let service: HashService;

  beforeEach(() => {
    service = new HashService();
  });

  describe('hashPassword', () => {
    it('should call bcrypt.hash with correct payload', async () => {
      const hashMock = jest.spyOn(bcrypt, 'hash');
      await service.hashPassword('meinPW');
      expect(hashMock).toHaveBeenCalledWith('meinPW', 10);
      hashMock.mockRestore();
    });
  });

  describe('comparePasswords', () => {
    it('should call bcrypt.compare with correct payload and return true', async () => {
      const compareMock = jest.spyOn(bcrypt, 'compare');
      const password = 'password123';
      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await service.comparePasswords(password, hashedPassword);
      expect(compareMock).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toBe(true);
      compareMock.mockRestore();
    });

    it('should call bcrypt.compare with correct payload and return false', async () => {
      const compareMock = jest.spyOn(bcrypt, 'compare');
      const password = 'password123';
      const hashedPassword = await bcrypt.hash('otherPassword', 10);

      const result = await service.comparePasswords(password, hashedPassword);
      expect(compareMock).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toBe(false);
      compareMock.mockRestore();
    });
  });
});
