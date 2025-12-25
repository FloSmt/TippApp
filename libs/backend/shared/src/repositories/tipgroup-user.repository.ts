import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { TipgroupUser } from '@tippapp/shared/data-access';

@Injectable()
export class TipgroupUserRepository extends Repository<TipgroupUser> {
  constructor(private dataSource: DataSource) {
    super(TipgroupUser, dataSource.createEntityManager());
  }
}
