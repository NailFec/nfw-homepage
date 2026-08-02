(function () {
	const yearEl = document.getElementById('year');
	if (yearEl) yearEl.textContent = String(new Date().getFullYear());

	const storageKey = 'theme-preference';
	const toggle = document.getElementById('themeToggle');
	if (toggle) {
		toggle.addEventListener('click', () => {
			const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
			document.documentElement.dataset.theme = next;
			localStorage.setItem(storageKey, next);
		});
	}

	const GITHUB_USER = 'NailFec';
	const FEATURED_REPOS = new Set(['RubricFlow', 'liminal', 'linux-dotfiles', 'clock', 'calculator', 'shyc_ssd']);

	function escapeHtml(value) {
		return String(value)
			.replaceAll('&', '&amp;')
			.replaceAll('<', '&lt;')
			.replaceAll('>', '&gt;')
			.replaceAll('"', '&quot;')
			.replaceAll("'", '&#39;');
	}

	async function loadRepos() {
		const grid = document.getElementById('repoGrid');
		if (!grid) return;

		try {
			const res = await fetch(
				`https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=100`
			);
			if (!res.ok) throw new Error(`GitHub API ${res.status}`);
			const repos = await res.json();
			const hidden = new Set(['NailFec', 'nfw-homepage']);

			const filtered = repos
				.filter((repo) => !repo.fork && !repo.archived && !hidden.has(repo.name))
				.sort((a, b) => {
					const af = FEATURED_REPOS.has(a.name) ? 1 : 0;
					const bf = FEATURED_REPOS.has(b.name) ? 1 : 0;
					if (af !== bf) return bf - af;
					return new Date(b.updated_at) - new Date(a.updated_at);
				})
				.slice(0, 9);

			if (!filtered.length) {
				grid.innerHTML = '<p class="muted">No public repositories to show yet.</p>';
				return;
			}

			grid.innerHTML = filtered
				.map((repo) => {
					const description = repo.description || 'No description provided.';
					const language = repo.language ? `${escapeHtml(repo.language)} · ` : '';
					return `
						<a class="repo-card" href="${escapeHtml(repo.html_url)}" target="_blank" rel="noreferrer noopener">
							<h3>${escapeHtml(repo.name)}</h3>
							<p>${escapeHtml(description)}</p>
							<div class="repo-meta">${language}★ ${repo.stargazers_count} · Updated ${escapeHtml(repo.updated_at.slice(0, 10))}</div>
						</a>
					`;
				})
				.join('');
		} catch (error) {
			grid.innerHTML = `
				<p class="muted">
					Could not load repositories.
					<a href="https://github.com/${GITHUB_USER}" target="_blank" rel="noreferrer noopener">Open GitHub instead →</a>
				</p>
			`;
			console.error(error);
		}
	}

	loadRepos();
})();
