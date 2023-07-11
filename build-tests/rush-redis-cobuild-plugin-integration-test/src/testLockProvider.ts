import {
  RedisCobuildLockProvider,
  IRedisCobuildLockProviderOptions
} from '@rushstack/rush-redis-cobuild-plugin';
import { ConsoleTerminalProvider } from '@rushstack/node-core-library';
import { OperationStatus, ICobuildContext, RushSession } from '@microsoft/rush-lib';

const options: IRedisCobuildLockProviderOptions = {
  url: 'redis://localhost:6379',
  password: 'redis123'
};

const rushSession: RushSession = new RushSession({
  terminalProvider: new ConsoleTerminalProvider(),
  getIsDebugMode: () => true
});

async function main(): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lockProvider: RedisCobuildLockProvider = new RedisCobuildLockProvider(options, rushSession as any);
  await lockProvider.connectAsync();
  const context: ICobuildContext = {
    contextId: 'context_id',
    cacheId: 'cache_id',
    lockKey: 'lock_key',
    lockExpireTimeInSeconds: 30,
    completedStateKey: 'completed_state_key',
    clusterId: 'cluster_id',
    runnerId: 'runner_id',
    packageName: 'package_name',
    phaseName: 'phase_name'
  };
  await lockProvider.acquireLockAsync(context);
  await lockProvider.renewLockAsync(context);
  await lockProvider.setCompletedStateAsync(context, {
    status: OperationStatus.Success,
    cacheId: 'cache_id'
  });
  const completedState = await lockProvider.getCompletedStateAsync(context);
  console.log('Completed state: ', completedState);
  await lockProvider.disconnectAsync();
}
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
