import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { MATCHDATA_MOCK, setupE2ETestEnvironment, TipgroupFactory } from '@tippapp/backend/test-helper';
import { ClientProxy } from '@nestjs/microservices';
import { Match } from '@tippapp/shared/data-access';

describe.only('ApiUpdatesController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let clientProxy: ClientProxy;
  let tipgroupFactory: TipgroupFactory;

  beforeAll(async () => {
    const setup = await setupE2ETestEnvironment(true);
    app = setup.app;
    clientProxy = setup.clientProxy;
    dataSource = setup.dataSource;
    tipgroupFactory = new TipgroupFactory(app, dataSource);

    await clientProxy.connect();
  });

  it('should be able to update match if broker sends message', async () => {
    const payload = {
      ...MATCHDATA_MOCK[0],
      matchID: 1,
      lastUpdateDateTime: new Date('2024-01-15T00:00:00Z'),
      matchResults: [{ pointsTeam1: 1, pointsTeam2: 2 }],
    };

    const match = new Match();
    match.api_matchId = 1;
    match.lastApiUpdateDate = new Date('2024-01-02T00:00:00Z');
    match.kickoffDate = new Date('2024-01-01T00:00:00Z');
    match.scoreHome = null;
    match.scoreAway = null;

    const matchBefore = await dataSource.getRepository(Match).save(match);

    clientProxy.emit('openligadb/test', payload);
    expect(matchBefore).toBeTruthy();
    expect(matchBefore.api_matchId).toBe(1);
    expect(matchBefore.scoreAway).toBeNull();
    expect(matchBefore.scoreHome).toBeNull();
    expect(matchBefore.lastApiUpdateDate).toStrictEqual(new Date('2024-01-02T00:00:00Z'));

    // Wait for the event to be processed
    await new Promise((res) => setTimeout(res, 500));

    const matchAfter = await dataSource.getRepository(Match).findOneBy({ api_matchId: 1 });
    expect(matchAfter).toBeTruthy();
    expect(matchAfter.scoreHome).toBe(1);
    expect(matchAfter.scoreAway).toBe(2);
    expect(matchAfter.lastApiUpdateDate).toStrictEqual(new Date('2024-01-15T00:00:00Z'));
  });

  afterEach(async () => {
    await tipgroupFactory.clearDatabase();
  });

  afterAll(async () => {
    await clientProxy.close();
    await app.close();
  });
});
