<svelte:head>
	<title>PflegeDMS - Startseite</title>
	<meta name="description" content="Pflegedienst Management System" />
</svelte:head>

<section>
	<h1>Willkommen bei PflegeDMS</h1>
	<p>Pflegedienst Management System</p>
	<div>
		<a href="/login" class="btn">Login</a>
		<a href="/dashboard" class="btn btn-secondary">Dashboard</a>
	</div>
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		padding: 2rem;
	}

	h1 {
		font-size: 2.5rem;
		margin-bottom: 1rem;
	}

	p {
		font-size: 1.2rem;
		color: #666;
		margin-bottom: 2rem;
	}

	.btn {
		display: inline-block;
		padding: 0.75rem 1.5rem;
		background: #007bff;
		color: white;
		text-decoration: none;
		border-radius: 4px;
		margin: 0 0.5rem;
	}

	.btn-secondary {
		background: #6c757d;
	}

	.btn:hover {
		opacity: 0.8;
	}
</style>