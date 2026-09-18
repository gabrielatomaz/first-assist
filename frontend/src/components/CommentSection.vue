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
            <UserAvatar 
              :icon="comment.authorId?.avatarIcon || 'user'"
              :color="comment.authorId?.avatarColor || '#4F7F82'"
              size="xs"
              :hasBg="true"
            />
            <span 
              class="font-extrabold text-xs"
              :class="{
                'text-accentYellow': comment.authorId?.role === 'ADMIN',
                'text-primaryTeal': comment.authorId?.role === 'FTA',
                'text-accentPurple': comment.authorId?.role === 'CSA',
                'text-white': !['ADMIN', 'FTA', 'CSA'].includes(comment.authorId?.role)
              }"
            >
              {{ comment.authorId?.name || 'Volunteer' }}
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
                <font-awesome-icon icon="pen-to-square" class="w-3.5 h-3.5" />
              </button>
              <button 
                @click="openDeleteModal(comment._id)" 
                class="text-gray-400 hover:text-accentCoral transition p-1" 
                title="Delete Comment"
              >
                <font-awesome-icon icon="trash-can" class="w-3.5 h-3.5" />
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
            <BaseTextarea
              v-model="editText"
              rows="2"
            />
            
            <!-- Image Edit / Remove -->
            <div v-if="editImageUrl" class="relative inline-block">
              <img :src="editImageUrl" class="h-20 rounded-xl border border-gray-700 object-cover" />
              <button 
                @click="editImageUrl = null" 
                class="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow cursor-pointer"
              >
                <font-awesome-icon icon="xmark" />
              </button>
            </div>

            <div class="flex justify-end space-x-2">
              <BaseButton 
                size="sm"
                variant="secondary"
                @click="cancelEditing" 
              >
                Cancel
              </BaseButton>
              <BaseButton 
                size="sm"
                variant="primary"
                @click="handleUpdateComment(comment._id)" 
                :disabled="updating" 
                :loading="updating"
                loading-text="Saving..."
              >
                Save
              </BaseButton>
            </div>
          </div>
        </template>
      </div>

      <div v-if="comments.length === 0" class="text-center py-8 text-sm text-gray-400">
        No comments yet. Post an update to start coordination.
      </div>
    </div>

    <!-- Image Attachment Preview before submission -->
    <div v-if="attachedImage" class="relative inline-block bg-bgMain p-1.5 rounded-xl border border-borderDefault">
      <img :src="attachedImage" alt="Preview" class="h-20 rounded-lg object-cover border border-gray-700" />
      <button 
        @click="attachedImage = null" 
        class="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow hover:bg-red-700 cursor-pointer"
        title="Remove Picture"
      >
        <font-awesome-icon icon="xmark" />
      </button>
    </div>

    <!-- Post Comment Form with Attachment Icon & Lighter Color Compact Send Button -->
    <form @submit.prevent="handlePostComment" class="flex items-center space-x-2">
      <!-- Paperclip Attachment Icon Button (h-11 matching BaseInput) -->
      <BaseButton
        type="button"
        @click="triggerFileInput"
        variant="secondary"
        size="icon-md"
        icon="paperclip"
        title="Attach Picture"
      />
      <input 
        type="file" 
        ref="fileInputRef" 
        accept="image/*" 
        class="hidden" 
        @change="handleFileSelected" 
      />

      <!-- Text Input (h-11) -->
      <BaseInput
        v-model="newComment"
        placeholder="Type an update or attach a picture..."
        class="flex-1"
      />

      <!-- Send Button (h-11) -->
      <BaseButton
        type="submit"
        :disabled="posting || (!newComment.trim() && !attachedImage)"
        :loading="posting"
        variant="primary"
        size="icon-md"
        icon="paper-plane"
        title="Send Update"
      />
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
          <font-awesome-icon icon="xmark" />
        </button>
      </div>
    </div>

    <!-- Styled Delete Confirmation Modal Overlay -->
    <ConfirmationModal
      :model-value="!!deleteModalCommentId"
      @update:model-value="(val) => { if (!val) deleteModalCommentId = null; }"
      title="Delete Update?"
      message="Are you sure you want to permanently delete this update comment? This action cannot be undone."
      icon="trash-can"
      variant="danger"
      confirm-text="Delete"
      confirm-icon="trash-can"
      cancel-text="Cancel"
      :loading="deleting"
      loading-text="Deleting..."
      @confirm="executeDeleteComment"
      @cancel="deleteModalCommentId = null"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { getApiUrl } from '../config/api';
import UserAvatar from './UserAvatar.vue';
import ConfirmationModal from './ConfirmationModal.vue';
import BaseButton from './common/BaseButton.vue';
import BaseInput from './common/BaseInput.vue';
import BaseTextarea from './common/BaseTextarea.vue';

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
