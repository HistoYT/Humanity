document.addEventListener('DOMContentLoaded', function () {
	const toggle = document.querySelector('.nav-toggle');
	const nav = document.getElementById('main-nav');

	if (!toggle || !nav) return;

	toggle.addEventListener('click', function () {
		const isOpen = toggle.classList.toggle('open');
		nav.classList.toggle('open', isOpen);
		toggle.setAttribute('aria-expanded', String(isOpen));
		// update accessible label
		toggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
	});

	// Close menu when clicking outside (mobile)
	document.addEventListener('click', (e) => {
		if (!isOpenMenu()) return;
		const inside = e.target.closest('.site-header');
		if (!inside) closeMenu();
	});

	function isOpenMenu(){
		return nav.classList.contains('open');
	}

	function closeMenu(){
		nav.classList.remove('open');
		toggle.classList.remove('open');
		toggle.setAttribute('aria-expanded','false');
		toggle.setAttribute('aria-label','Abrir menú');
	}
});

