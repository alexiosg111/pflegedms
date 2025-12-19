<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { feedbackService, type FeedbackInput } from '../services/feedbackService';
  import Button from './Button.svelte';
  import { toastStore } from '../stores/toastStore';

  export let isOpen = false;

  const dispatch = createEventDispatcher();

  let type: FeedbackInput['type'] = 'general';
  let message = '';
  let rating = 0;
  let contactEmail = '';
  let isSubmitting = false;

  function close() {
    dispatch('close');
  }

  async function handleSubmit() {
    if (!message.trim()) return;

    isSubmitting = true;
    try {
      await feedbackService.submitFeedback({
        type,
        message,
        rating: rating > 0 ? rating : undefined,
        contact_email: contactEmail || undefined
      });

      toastStore.addToast({
        message: 'Vielen Dank für Ihr Feedback!',
        type: 'success'
      });

      // Reset form
      message = '';
      rating = 0;
      type = 'general';
      
      close();
    } catch (err) {
      toastStore.addToast({
        message: 'Fehler beim Senden des Feedbacks.',
        type: 'error'
      });
    } finally {
      isSubmitting = false;
    }
  }

  function setRating(r: number) {
    rating = r;
  }
</script>

{#if isOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md p-6 m-4" role="dialog" aria-modal="true">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold text-gray-900">Feedback senden</h2>
        <button on:click={close} class="text-gray-400 hover:text-gray-600">
          <span class="text-2xl">&times;</span>
        </button>
      </div>

      <form on:submit|preventDefault={handleSubmit} class="space-y-4">
        <!-- Type Selection -->
        <div class="flex space-x-2 p-1 bg-gray-100 rounded-lg">
          <button
            type="button"
            class={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${type === 'general' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            on:click={() => type = 'general'}
          >
            Allgemein
          </button>
          <button
            type="button"
            class={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${type === 'feature' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            on:click={() => type = 'feature'}
          >
            Feature
          </button>
          <button
            type="button"
            class={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${type === 'bug' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            on:click={() => type = 'bug'}
          >
            Fehler
          </button>
        </div>

        <!-- Rating (only for general/feature) -->
        {#if type !== 'bug'}
          <div class="flex flex-col items-center py-2">
            <span class="text-sm text-gray-600 mb-2">Wie zufrieden sind Sie?</span>
            <div class="flex space-x-2">
              {#each [1, 2, 3, 4, 5] as star}
                <button
                  type="button"
                  on:click={() => setRating(star)}
                  class="text-2xl focus:outline-none transform transition-transform hover:scale-110"
                >
                  {star <= rating ? '⭐' : '☆'}
                </button>
              {/each}
            </div>
          </div>
        {/if}

        <!-- Message -->
        <div>
          <label for="feedback-message" class="block text-sm font-medium text-gray-700 mb-1">
            {type === 'bug' ? 'Problembeschreibung' : 'Ihre Nachricht'}
          </label>
          <textarea
            id="feedback-message"
            bind:value={message}
            rows="4"
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            placeholder={type === 'bug' ? 'Was haben Sie getan? Was ist passiert? Was haben Sie erwartet?' : 'Teilen Sie uns Ihre Gedanken mit...'}
            required
          ></textarea>
        </div>

        <!-- Email (Optional) -->
        <div>
          <label for="feedback-email" class="block text-sm font-medium text-gray-700 mb-1">
            E-Mail (optional für Rückfragen)
          </label>
          <input
            type="email"
            id="feedback-email"
            bind:value={contactEmail}
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
          />
        </div>

        <!-- Actions -->
        <div class="flex justify-end space-x-3 pt-4">
          <Button variant="ghost" on:click={close}>Abbrechen</Button>
          <Button type="submit" loading={isSubmitting} disabled={!message.trim()}>
            Senden
          </Button>
        </div>
      </form>
    </div>
  </div>
{/if}
