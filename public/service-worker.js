self.addEventListener('push', (event) => {
    const options = {
      body: event.data.text(),
      icon: '/icon.png',
      badge: '/icon.png',
    };
    event.waitUntil(self.registration.showNotification('Time to feed the baby!', options));
  });
  