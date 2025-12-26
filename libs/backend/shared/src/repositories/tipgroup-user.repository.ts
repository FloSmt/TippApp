import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { TipgroupUser } from '@tippapp/shared/data-access';

@Injectable()
export class TipgroupUserRepository extends Repository<TipgroupUser> {
  constructor(private dataSource: DataSource) {
    super(TipgroupUser, dataSource.createEntityManager());
  }

  async getAllTipgroupsForUser(userId: number): Promise<TipgroupUser[]> {
    return await this.dataSource
      .createQueryBuilder(TipgroupUser, 'tgUser')
      .leftJoinAndSelect('tgUser.tipgroup', 'tipgroup')
      .leftJoinAndSelect('tipgroup.seasons', 'season', 'season.isClosed = :isClosed', { isClosed: false })
      .where('tgUser.userId = :userId', { userId })
      .getMany();
  }
}
