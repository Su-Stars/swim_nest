import { Test, TestingModule } from '@nestjs/testing';
import { SwimLogsService } from './swim_logs.service';

describe('SwimLogsService', () => {
  let service: SwimLogsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SwimLogsService],
    }).compile();

    service = module.get<SwimLogsService>(SwimLogsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
