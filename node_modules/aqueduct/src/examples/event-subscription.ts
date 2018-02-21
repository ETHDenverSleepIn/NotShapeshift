import { Aqueduct } from '../generated/aqueduct';

// Initialize client
Aqueduct.Initialize();

const subscription = new Aqueduct.Events.AccountNotification().subscribe({
  account: 'XXXX'
}, data => {
  console.log(data);
});

// some time later
subscription.unsubscribe();
