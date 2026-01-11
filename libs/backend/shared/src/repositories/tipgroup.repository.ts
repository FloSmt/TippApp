import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Tipgroup } from '@tippapp/shared/data-access';

@Injectable()
export class TipgroupRepository extends Repository<Tipgroup> {
  constructor(private dataSource: DataSource) {
    super(Tipgroup, dataSource.createEntityManager());
  }

  async getTipgroupById(tipgroupId: number): Promise<Tipgroup | null> {
    return this.dataSource
      .createQueryBuilder(Tipgroup, 'tipgroup')
      .leftJoinAndSelect('tipgroup.seasons', 'season', 'season.isClosed = false')
      .where('tipgroup.id = :tipgroupId', { tipgroupId })
      .getOne();
  }
}
