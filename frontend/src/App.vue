<template>
  <div class="min-h-screen bg-bgMain">
    <nav class="bg-primaryNavy p-4 text-white shadow-md">
      <div class="container mx-auto flex justify-between items-center">
        <h1 class="text-xl font-bold tracking-wider">FIRST Assist</h1>
        <div class="space-x-4">
          <router-link to="/" class="hover:text-accentLightblue transition">Dashboard</router-link>
          <router-link to="/create" class="bg-primaryTeal px-4 py-2 rounded shadow hover:bg-opacity-90 transition">New Incident</router-link>
        </div>
      </div>
    </nav>
    <main class="container mx-auto p-4 mt-6">
      <router-view></router-view>
    </main>
  </div>
</template>

<script setup>
// Main App Component
</script>
