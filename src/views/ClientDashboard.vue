<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '../api/axios'

const perfil = ref<any>(null)

onMounted(async () => {
  try {
    const { data } = await api.get('/v1/users/me')
    perfil.value = data
  } catch (error) {
    console.error("Error cargando perfil", error)
  }
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-3xl font-bold text-gray-900 mb-6">Mi Panel de Cliente</h1>
    
    <div v-if="perfil" class="mb-8 p-6 bg-white rounded-xl shadow border border-gray-100 flex items-center space-x-4">
      <div class="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl">
        {{ perfil.nombreCompleto?.charAt(0) || 'U' }}
      </div>
      <div>
        <h2 class="text-xl font-bold">{{ perfil.nombreCompleto }}</h2>
        <p class="text-gray-500">{{ perfil.email }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 class="text-lg font-semibold mb-2">Mis Reservas</h3>
        <p class="text-gray-500 text-sm mb-4">Gestiona tus próximas estadías.</p>
        <button class="text-indigo-600 font-medium text-sm hover:underline">Ver reservas activas &rarr;</button>
      </div>
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 class="text-lg font-semibold mb-2">Favoritos</h3>
        <p class="text-gray-500 text-sm mb-4">Lugares que te han encantado.</p>
        <button class="text-indigo-600 font-medium text-sm hover:underline">Ver lista &rarr;</button>
      </div>
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 class="text-lg font-semibold mb-2">Mis Puntos</h3>
        <p class="text-gray-500 text-sm mb-4">Acumula y canjea por descuentos.</p>
        <div class="text-2xl font-bold text-indigo-600 mt-2">0 pts</div>
      </div>
    </div>
  </div>
</template>
