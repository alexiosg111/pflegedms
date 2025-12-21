<svelte:head>
	<title>Login - PflegeDMS</title>
</svelte:head>

<div class="login-container">
	<h1>Login</h1>
	<form>
		<div class="form-group">
			<label for="username">Benutzername</label>
			<input type="text" id="username" name="username" required />
		</div>
		<div class="form-group">
			<label for="password">Passwort</label>
			<input type="password" id="password" name="password" required />
		</div>
		<button type="submit">Anmelden</button>
	</form>
</div>

<style>
	.login-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		padding: 2rem;
	}

	form {
		width: 100%;
		max-width: 400px;
		background: white;
		padding: 2rem;
		border-radius: 8px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 500;
	}

	input {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 1rem;
	}

	input:focus {
		outline: none;
		border-color: #007bff;
	}

	button {
		width: 100%;
		padding: 0.75rem;
		background: #007bff;
		color: white;
		border: none;
		border-radius: 4px;
		font-size: 1rem;
		cursor: pointer;
		font-weight: 500;
	}

	button:hover {
		background: #0056b3;
	}
</style>