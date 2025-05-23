import { PartialType } from '@nestjs/swagger';
import { CreateTipgroupDto } from './create-tipgroup.dto';

export class UpdateTipgroupDto extends PartialType(CreateTipgroupDto) {}
