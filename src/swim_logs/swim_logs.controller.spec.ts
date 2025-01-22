import { Test, TestingModule } from '@nestjs/testing';
import { SwimLogsController } from './swim_logs.controller';

describe('SwimLogsController', () => {
  let controller: SwimLogsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SwimLogsController],
    }).compile();

    controller = module.get<SwimLogsController>(SwimLogsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
