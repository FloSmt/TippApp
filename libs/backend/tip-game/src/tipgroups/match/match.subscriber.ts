import { DataSource, EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Match } from '@tippapp/shared/data-access';
import { EventEmitter2 } from '@nestjs/event-emitter';

@EventSubscriber()
@Injectable()
export class MatchSubscriber implements EntitySubscriberInterface<Match> {
  constructor(dataSource: DataSource, private eventEmitter: EventEmitter2) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return Match;
  }

  async afterInsert(event: InsertEvent<Match>): Promise<void> {
    const newMatch = event.entity;

    if (!newMatch) {
      return;
    }

    const updatedMatches = await event.manager.findOne(Match, {
      where: { api_matchId: newMatch.api_matchId },
      select: ['id', 'api_matchId'],
    });

    if (!updatedMatches) {
      return;
    }

    this.eventEmitter.emit('matchday.recalculate', { matchId: updatedMatches.id });
  }

  async afterUpdate(event: UpdateEvent<Match>) {
    const oldMatch = event.databaseEntity;
    const newMatch = event.entity;

    if (!oldMatch || !newMatch) {
      return;
    }

    const statusChangedToFinished = !oldMatch.isFinished && newMatch['isFinished'];
    const kickoffDateChanged = oldMatch.kickoffDate.getTime() !== newMatch['kickoffDate'].getTime();

    if (statusChangedToFinished || kickoffDateChanged) {
      const matchId = oldMatch.id || newMatch['id'];
      this.eventEmitter.emit('matchday.recalculate', { matchId });
    }
  }
}
