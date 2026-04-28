<script setup lang="ts">
import { ref } from 'vue'
import api from '../api/axios'

const nuevaPropiedad = ref({
  nombre: '',
  descripcion: '',
  ciudadId: 1, // 1 = Quito, 2 = Guayaquil
  direccion: '',
  precioPorNoche: 0,
  capacidadAdultos: 1,
  tipoAlojamientoId: 3 // 3 = Suite
})

const fotos = ref<File[]>([])
const mensaje = ref('')

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    fotos.value = Array.from(target.files)
  }
}

const crearPropiedad = async () => {
  try {
    const formData = new FormData()
    formData.append('Nombre', nuevaPropiedad.value.nombre)
    formData.append('Descripcion', nuevaPropiedad.value.descripcion)
    formData.append('CiudadId', nuevaPropiedad.value.ciudadId.toString())
    formData.append('Direccion', nuevaPropiedad.value.direccion)
    formData.append('PrecioPorNoche', nuevaPropiedad.value.precioPorNoche.toString())
    formData.append('CapacidadAdultos', nuevaPropiedad.value.capacidadAdultos.toString())
    formData.append('TipoAlojamientoId', nuevaPropiedad.value.tipoAlojamientoId.toString())

    fotos.value.forEach(foto => {
      formData.append('Fotos', foto)
    })

    await api.post('/v1/properties', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    
    mensaje.value = '¡Propiedad creada con éxito y fotos subidas!'
    nuevaPropiedad.value = { nombre: '', descripcion: '', ciudadId: 1, direccion: '', precioPorNoche: 0, capacidadAdultos: 1, tipoAlojamientoId: 3 }
    fotos.value = []
  } catch (error: any) {
    mensaje.value = 'Error al crear: ' + (error.response?.data?.message || error.message)
  }
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-3xl font-bold text-gray-900 mb-6">Mi Panel de Anfitrión</h1>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-indigo-500">
        <h3 class="text-sm font-medium text-gray-500 mb-1">Total Propiedades</h3>
        <p class="text-3xl font-bold text-gray-900">0</p>
      </div>
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-green-500">
        <h3 class="text-sm font-medium text-gray-500 mb-1">Reservas Activas</h3>
        <p class="text-3xl font-bold text-gray-900">0</p>
      </div>
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-yellow-500">
        <h3 class="text-sm font-medium text-gray-500 mb-1">Puntos Acumulados</h3>
        <p class="text-3xl font-bold text-gray-900">0</p>
      </div>
    </div>

    <!-- Agregar Propiedad -->
    <div class="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
      <h2 class="text-2xl font-bold mb-4">Publicar nueva Propiedad</h2>
      <form @submit.prevent="crearPropiedad" class="space-y-4 max-w-2xl">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Nombre</label>
            <input v-model="nuevaPropiedad.nombre" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Tipo de Alojamiento</label>
            <select v-model="nuevaPropiedad.tipoAlojamientoId" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border">
              <option :value="1">Hotel</option>
              <option :value="2">Departamento</option>
              <option :value="3">Suite</option>
              <option :value="4">Casa</option>
            </select>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Descripción</label>
          <textarea v-model="nuevaPropiedad.descripcion" required rows="2" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border"></textarea>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Ciudad</label>
            <select v-model="nuevaPropiedad.ciudadId" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border">
              <option :value="1">Quito</option>
              <option :value="2">Guayaquil</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Dirección Exacta</label>
            <input v-model="nuevaPropiedad.direccion" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border">
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Precio x Noche (USD)</label>
            <input v-model="nuevaPropiedad.precioPorNoche" type="number" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Capacidad Máxima (Adultos)</label>
            <input v-model="nuevaPropiedad.capacidadAdultos" type="number" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border">
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Fotos de la Propiedad</label>
          <input type="file" multiple @change="handleFileUpload" accept="image/*" class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100">
          <p class="text-xs text-gray-400 mt-1">Puedes seleccionar múltiples imágenes. La primera será la portada.</p>
        </div>
        <button type="submit" class="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors">Publicar Propiedad con Fotos</button>
        <p v-if="mensaje" class="mt-2 text-center font-medium" :class="mensaje.includes('Error') ? 'text-red-600' : 'text-green-600'">{{ mensaje }}</p>
      </form>
    </div>
  </div>
</template>
