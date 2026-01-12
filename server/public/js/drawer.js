document.addEventListener('DOMContentLoaded', () => {
  const gearBtn = document.getElementById('gearBtn');
  const drawer = document.getElementById('drawer');
  const drawerOverlay = document.getElementById('drawerOverlay');
  const drawerClose = document.getElementById('drawerClose');
  const logoutBtn = document.getElementById('logoutBtn');
  const userName = document.getElementById('userName');
  const userInitial = document.getElementById('userInitial');
  if (!gearBtn || !drawer) return;

  // Fetch user info
  fetch('/api/auth/me')
    .then(res => res.json())
    .then(data => {
      if (data.username) {
        userName.textContent = data.username;
        userInitial.textContent = data.username.charAt(0).toUpperCase();
      }
    })
    .catch(err => {
      console.error('Failed to load user info:', err);
      userName.textContent = 'User';
      userInitial.textContent = 'U';
    });

  // Open drawer
  gearBtn.addEventListener('click', () => {
    drawer.classList.add('active');
    drawerOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  });

  // Close drawer
  const closeDrawer = () => {
    drawer.classList.remove('active');
    drawerOverlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  drawerClose.addEventListener('click', closeDrawer);
  drawerOverlay.addEventListener('click', closeDrawer);

  // Logout
  logoutBtn.addEventListener('click', async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (response.ok) {
        window.location.href = '/login';
      }
    } catch (err) {
      console.error('Logout failed:', err);
    }
  });
});