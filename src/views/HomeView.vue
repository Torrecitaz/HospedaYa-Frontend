<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api/axios'

const router = useRouter()

interface Propiedad {
  id: number
  nombre: string
  ciudad: string
  precioPorNoche: number
  moneda: string
  calificacion: number
  imagenesUrls: string[]
}

const propiedades = ref<Propiedad[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const { data } = await api.get('/v1/properties/search')
    propiedades.value = data.items || data // Dependiendo de la estructura paginada
  } catch (error) {
    console.error('Error cargando propiedades:', error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Descubre lugares increíbles</h1>
      <p class="mt-2 text-lg text-gray-500">Encuentra tu próximo alojamiento perfecto, desde cabañas acogedoras hasta villas de lujo.</p>
    </div>

    <!-- Buscador (placeholder) -->
    <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8 flex gap-4">
      <input type="text" placeholder="¿A dónde vas?" class="flex-1 px-4 py-2 bg-gray-50 border-transparent rounded-lg focus:border-indigo-500 focus:bg-white focus:ring-0 transition-colors">
      <button class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium shadow-sm transition-colors">Buscar</button>
    </div>

    <!-- Grid de Propiedades -->
    <div v-if="loading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
    
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div v-for="prop in propiedades" :key="prop.id" class="group cursor-pointer" @click="router.push(`/property/${prop.id}`)">
        <div class="aspect-w-4 aspect-h-3 rounded-2xl overflow-hidden bg-gray-200 mb-3 relative">
          <img :src="prop.imagenesUrls?.length ? prop.imagenesUrls[0] : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'" 
               :alt="prop.nombre"
               class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300">
          <button class="absolute top-3 right-3 p-2 bg-white/70 backdrop-blur rounded-full hover:bg-white transition-colors">
            <svg class="w-5 h-5 text-gray-600 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
          </button>
        </div>
        <div class="flex justify-between items-start">
          <div>
            <h3 class="font-semibold text-gray-900 line-clamp-1">{{ prop.nombre }}</h3>
            <p class="text-gray-500 text-sm">{{ prop.ciudad }}</p>
          </div>
          <div class="flex items-center space-x-1">
            <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
            <span class="text-sm font-medium">{{ prop.calificacion.toFixed(1) }}</span>
          </div>
        </div>
        <p class="mt-1">
          <span class="font-semibold text-gray-900">${{ prop.precioPorNoche }} {{ prop.moneda }}</span>
          <span class="text-gray-500 text-sm"> / noche</span>
        </p>
      </div>
    </div>
  </div>
</template>
