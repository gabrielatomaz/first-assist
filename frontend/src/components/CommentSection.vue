<template>
  <div class="space-y-6">
    <h3 class="text-lg font-bold text-primaryTeal border-b border-gray-800 pb-3">Updates & Discussion</h3>

    <!-- Comments List -->
    <div v-if="loading" class="text-center py-6">
      <div class="inline-block animate-spin rounded-full h-6 w-6 border-2 border-primaryTeal border-t-transparent"></div>
    </div>

    <div v-else class="space-y-4 max-h-[420px] overflow-y-auto pr-2">
      <div 
        v-for="comment in comments" 
        :key="comment._id" 
        class="bg-bgMain p-4 rounded-xl border border-gray-800 flex flex-col space-y-2 relative group"
      >
        <!-- Header / Author Info -->
        <div class="flex justify-between items-center text-xs">
          <div class="flex items-center space-x-2">
            <span class="font-bold text-white">{{ comment.authorId?.name || 'Volunteer' }}</span>
            <span class="text-[9px] bg-bgCard text-primaryTeal px-1.5 py-0.5 rounded font-mono uppercase tracking-wider font-bold border border-gray-800">
              {{ comment.authorId?.role || 'CSA' }}
            </span>
          </div>
          
          <div class="flex items-center space-x-2">
            <span class="text-gray-400 text-[11px]">{{ formatDate(comment.createdAt) }}</span>
            
            <!-- Author / Admin Edit & Delete Actions -->
            <div v-if="canModifyComment(comment)" class="flex items-center space-x-1 pl-1">
              <button 
                @click="startEditing(comment)" 
                class="text-gray-400 hover:text-primaryTeal transition p-1" 
                title="Edit Comment"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
              </button>
              <button 
                @click="openDeleteModal(comment._id)" 
                class="text-gray-400 hover:text-accentCoral transition p-1" 
                title="Delete Comment"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Comment Content (Normal View) -->
        <template v-if="editingCommentId !== comment._id">
          <p v-if="comment.text" class="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">{{ comment.text }}</p>

          <!-- Attached Image View -->
          <div v-if="comment.imageUrl" class="mt-2">
            <img 
              :src="comment.imageUrl" 
              alt="Attachment" 
              @click="expandedImage = comment.imageUrl"
              class="max-h-48 rounded-lg border border-gray-700 object-cover cursor-pointer hover:opacity-90 transition shadow-sm" 
            />
          </div>
        </template>

        <!-- Inline Edit Mode -->
        <template v-else>
          <div class="space-y-2 mt-1">
            <textarea
              v-model="editText"
              rows="2"
              class="w-full px-3 py-2 rounded-lg border border-gray-700 bg-bgCard text-textMain text-sm focus:outline-none focus:ring-2 focus:ring-primaryTeal/20 focus:border-primaryTeal"
            ></textarea>
            
            <!-- Image Edit / Remove -->
            <div v-if="editImageUrl" class="relative inline-block">
              <img :src="editImageUrl" class="h-20 rounded border border-gray-700 object-cover" />
              <button 
                @click="editImageUrl = null" 
                class="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow"
              >
                ✕
              </button>
            </div>

            <div class="flex justify-end space-x-2">
              <button 
                @click="cancelEditing" 
                class="px-2.5 py-1 rounded text-xs font-semibold bg-gray-800 text-gray-300 hover:text-white border border-gray-700"
              >
                Cancel
              </button>
              <button 
                @click="handleUpdateComment(comment._id)" 
                :disabled="updating" 
                class="px-3 py-1 rounded text-xs font-bold bg-primaryTeal text-white shadow hover:bg-primaryTeal/90"
              >
                {{ updating ? 'Saving...' : 'Save' }}
              </button>
            </div>
          </div>
        </template>
      </div>

      <div v-if="comments.length === 0" class="text-center py-8 text-sm text-gray-400">
        No comments yet. Post an update to start coordination.
      </div>
    </div>

    <!-- Image Attachment Preview before submission -->
    <div v-if="attachedImage" class="relative inline-block bg-bgMain p-1.5 rounded-lg border border-gray-800">
      <img :src="attachedImage" alt="Preview" class="h-20 rounded object-cover border border-gray-700" />
      <button 
        @click="attachedImage = null" 
        class="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow hover:bg-red-700"
        title="Remove Picture"
      >
        ✕
      </button>
    </div>

    <!-- Post Comment Form with Attachment Icon & Lighter Color Compact Send Button -->
    <form @submit.prevent="handlePostComment" class="flex items-center space-x-2">
      <!-- Paperclip Attachment Icon Button -->
      <button
        type="button"
        @click="triggerFileInput"
        class="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-primaryTeal bg-bgMain border border-gray-700 hover:border-gray-600 rounded-lg transition flex-shrink-0 cursor-pointer"
        title="Attach Picture"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32a1.5 1.5 0 01-2.121-2.121l9.963-9.964" />
        </svg>
      </button>
      <input 
        type="file" 
        ref="fileInputRef" 
        accept="image/*" 
        class="hidden" 
        @change="handleFileSelected" 
      />

      <!-- Text Input -->
      <input
        v-model="newComment"
        type="text"
        placeholder="Type an update or attach a picture..."
        class="flex-grow px-3 py-2 rounded-lg border border-gray-700 bg-bgMain text-textMain focus:outline-none focus:ring-2 focus:ring-primaryTeal/20 focus:border-primaryTeal text-xs placeholder-gray-500"
      >

      <!-- Small Compact Send Button with Lighter Color -->
      <button
        type="submit"
        :disabled="posting || (!newComment.trim() && !attachedImage)"
        class="w-9 h-9 flex items-center justify-center bg-primaryTeal/25 hover:bg-primaryTeal text-primaryTeal hover:text-white border border-primaryTeal/40 rounded-lg transition duration-150 disabled:opacity-30 flex-shrink-0 shadow-sm cursor-pointer"
        title="Send Update"
      >
        <span v-if="posting" class="animate-spin text-xs">⏳</span>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
        </svg>
      </button>
    </form>

    <!-- Expanded Image View Modal -->
    <div 
      v-if="expandedImage" 
      @click="expandedImage = null" 
      class="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fadeIn cursor-pointer"
    >
      <div class="relative max-w-3xl max-h-[90vh]">
        <img :src="expandedImage" class="max-w-full max-h-[85vh] rounded-xl shadow-2xl border border-gray-700 object-contain" />
        <button 
          @click.stop="expandedImage = null" 
          class="absolute -top-3 -right-3 bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold shadow"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- Styled Delete Confirmation Modal -->
    <div v-if="deleteModalCommentId" class="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div class="bg-bgCard border border-gray-700 p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4">
        <div class="flex items-center space-x-3 text-accentCoral">
          <span class="text-2xl">⚠️</span>
          <h3 class="text-lg font-bold text-white">Delete Update</h3>
        </div>
        <p class="text-sm text-gray-300">Are you sure you want to permanently delete this update comment? This action cannot be undone.</p>
        <div class="flex justify-end space-x-3 pt-2">
          <button @click="deleteModalCommentId = null" class="px-4 py-2 rounded-xl text-xs font-semibold bg-bgMain text-gray-300 hover:text-white border border-gray-700">Cancel</button>
          <button @click="executeDeleteComment" :disabled="deleting" class="px-4 py-2 rounded-xl text-xs font-bold bg-accentCoral hover:bg-accentCoral/90 text-white shadow">
            {{ deleting ? 'Deleting...' : 'Delete Update' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { getApiUrl } from '../config/api';

const props = defineProps({
  incidentId: { type: String, required: true }
});

const authStore = useAuthStore();
const comments = ref([]);
const loading = ref(true);
const newComment = ref('');
const posting = ref(false);
const attachedImage = ref(null);
const fileInputRef = ref(null);
const expandedImage = ref(null);

// Editing state
const editingCommentId = ref(null);
const editText = ref('');
const editImageUrl = ref(null);
const updating = ref(false);

// Deleting state & modal
const deleteModalCommentId = ref(null);
const deleting = ref(false);

const canModifyComment = (comment) => {
  if (!authStore.user) return false;
  if (authStore.isAdmin) return true;
  const authorId = typeof comment.authorId === 'object' ? comment.authorId?._id : comment.authorId;
  return authorId === authStore.user._id;
};

const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const handleFileSelected = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    alert('File size exceeds 5MB limit.');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    attachedImage.value = e.target.result;
  };
  reader.readAsDataURL(file);
};

const fetchComments = async () => {
  loading.value = true;
  try {
    const response = await fetch(getApiUrl(`/incidents/${props.incidentId}/comments`), {
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
  if (!newComment.value.trim() && !attachedImage.value) return;
  posting.value = true;
  try {
    const response = await fetch(getApiUrl(`/incidents/${props.incidentId}/comments`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({
        text: newComment.value.trim(),
        imageUrl: attachedImage.value
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to post comment');
    
    comments.value.push(data);
    newComment.value = '';
    attachedImage.value = null;
    if (fileInputRef.value) fileInputRef.value.value = '';
  } catch (err) {
    alert(err.message);
  } finally {
    posting.value = false;
  }
};

const startEditing = (comment) => {
  editingCommentId.value = comment._id;
  editText.value = comment.text || '';
  editImageUrl.value = comment.imageUrl || null;
};

const cancelEditing = () => {
  editingCommentId.value = null;
  editText.value = '';
  editImageUrl.value = null;
};

const handleUpdateComment = async (commentId) => {
  updating.value = true;
  try {
    const response = await fetch(getApiUrl(`/incidents/comments/${commentId}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({
        text: editText.value.trim(),
        imageUrl: editImageUrl.value
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to update comment');

    const idx = comments.value.findIndex(c => c._id === commentId);
    if (idx !== -1) {
      comments.value[idx] = data;
    }
    cancelEditing();
  } catch (err) {
    alert(err.message);
  } finally {
    updating.value = false;
  }
};

const openDeleteModal = (commentId) => {
  deleteModalCommentId.value = commentId;
};

const executeDeleteComment = async () => {
  if (!deleteModalCommentId.value) return;
  try {
    deleting.value = true;
    const response = await fetch(getApiUrl(`/incidents/comments/${deleteModalCommentId.value}`), {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to delete comment');
    }
    comments.value = comments.value.filter(c => c._id !== deleteModalCommentId.value);
  } catch (err) {
    alert(err.message);
  } finally {
    deleting.value = false;
    deleteModalCommentId.value = null;
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
