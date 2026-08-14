<template>
  <div class="space-y-6">
    <h3 class="text-lg font-bold text-primaryTeal border-b border-gray-800 pb-3">Updates & Discussion</h3>

    <!-- Comments List -->
    <div v-if="loading" class="text-center py-6">
      <div class="inline-block animate-spin rounded-full h-6 w-6 border-2 border-primaryTeal border-t-transparent"></div>
    </div>

    <div v-else class="space-y-4 max-h-[400px] overflow-y-auto pr-2">
      <div v-for="comment in comments" :key="comment._id" class="bg-bgMain p-4 rounded-xl border border-gray-800 flex flex-col space-y-2">
        <div class="flex justify-between items-center text-xs">
          <div class="flex items-center space-x-2">
            <span class="font-bold text-white">{{ comment.authorId?.name }}</span>
            <span class="text-[9px] bg-bgCard text-primaryTeal px-1.5 py-0.5 rounded font-mono uppercase tracking-wider font-bold border border-gray-800">
              {{ comment.authorId?.role }}
            </span>
          </div>
          <span class="text-gray-400">{{ formatDate(comment.createdAt) }}</span>
        </div>
        <p class="text-sm text-gray-200 whitespace-pre-wrap">{{ comment.text }}</p>
      </div>

      <div v-if="comments.length === 0" class="text-center py-8 text-sm text-gray-400">
        No comments yet. Post an update to start coordination.
      </div>
    </div>

    <!-- Post Comment Form -->
    <form @submit.prevent="handlePostComment" class="flex space-x-3">
      <input
        v-model="newComment"
        type="text"
        required
        placeholder="Type an update or request help..."
        class="flex-grow px-4 py-2.5 rounded-lg border border-gray-700 bg-bgMain text-textMain focus:outline-none focus:ring-2 focus:ring-primaryTeal/20 focus:border-primaryTeal text-sm placeholder-gray-500"
      >
      <button
        type="submit"
        :disabled="posting"
        class="bg-primaryTeal hover:bg-primaryTeal/90 text-white font-semibold px-5 rounded-lg text-sm shadow hover:shadow-md transition duration-150 disabled:opacity-50"
      >
        {{ posting ? 'Sending...' : 'Send' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';

const props = defineProps({
  incidentId: { type: String, required: true }
});

const authStore = useAuthStore();
const comments = ref([]);
const loading = ref(true);
const newComment = ref('');
const posting = ref(false);

const fetchComments = async () => {
  loading.value = true;
  try {
    const response = await fetch(`http://localhost:3000/api/incidents/${props.incidentId}/comments`, {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    if (!response.ok) throw new Error('Failed to load comments');
    comments.value = await response.json();
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const handlePostComment = async () => {
  if (!newComment.value.trim()) return;
  posting.value = true;
  try {
    const response = await fetch(`http://localhost:3000/api/incidents/${props.incidentId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({ text: newComment.value })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to post comment');
    
    comments.value.push(data);
    newComment.value = '';
  } catch (err) {
    alert(err.message);
  } finally {
    posting.value = false;
  }
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

onMounted(() => {
  fetchComments();
});
</script>
