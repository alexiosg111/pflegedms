<script>
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	let isMaximized = false;

	onMount(() => {
		if (browser && window.electronAPI) {
			window.electronAPI.on('window-maximized', () => {
				isMaximized = true;
			});
			window.electronAPI.on('window-unmaximized', () => {
				isMaximized = false;
			});
		}
	});

	function minimizeWindow() {
		if (browser && window.electronAPI) {
			window.electronAPI.send('minimize-window');
		}
	}

	function maximizeWindow() {
		if (browser && window.electronAPI) {
			window.electronAPI.send('maximize-window');
		}
	}

	function closeWindow() {
		if (browser && window.electronAPI) {
			window.electronAPI.send('close-window');
		}
	}
</script>

{#if browser && window.electronAPI}
	<header class="desktop-header">
		<div class="app-title">
			<img src="/favicon.png" alt="App Icon" class="app-icon" />
			<span>PflegeDMS</span>
		</div>
		<div class="window-controls">
			<button class="control-btn minimize" on:click={minimizeWindow} title="Minimieren">
				<span>−</span>
			</button>
			<button class="control-btn maximize" on:click={maximizeWindow} title={isMaximized ? 'Wiederherstellen' : 'Maximieren'}>
				<span>{isMaximized ? '❐' : '□'}</span>
			</button>
			<button class="control-btn close" on:click={closeWindow} title="Schließen">
				<span>×</span>
			</button>
		</div>
	</header>
{/if}

<style>
	.desktop-header {
		-webkit-app-region: drag;
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 32px;
		background: #2c3e50;
		color: white;
		padding: 0 10px;
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 1000;
		border-bottom: 1px solid #34495e;
	}

	.app-title {
		display: flex;
		align-items: center;
		font-size: 14px;
		font-weight: 500;
		-webkit-app-region: no-drag;
	}

	.app-icon {
		width: 16px;
		height: 16px;
		margin-right: 8px;
	}

	.window-controls {
		display: flex;
		-webkit-app-region: no-drag;
	}

	.control-btn {
		width: 46px;
		height: 32px;
		background: none;
		border: none;
		color: white;
		font-size: 16px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background-color 0.2s;
	}

	.control-btn:hover {
		background-color: rgba(255, 255, 255, 0.1);
	}

	.control-btn.close:hover {
		background-color: #e74c3c;
	}

	.control-btn span {
		line-height: 1;
	}

	:global(body) {
		padding-top: 32px;
	}
</style>