<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../api/axios'

const route = useRoute()
const router = useRouter()
const prop = ref<any>(null)
const loading = ref(true)

const checkIn = ref('')
const checkOut = ref('')
const message = ref('')
const messageColor = ref('green')

const defaultImage = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'

onMounted(async () => {
  try {
    const { data } = await api.get(`/v1/properties/${route.params.id}`)
    prop.value = data
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
})

const getPhoto = (url: string) => {
  if (url && url.startsWith('/')) {
    const apiUrl = (import.meta.env.VITE_API_URL || '').replace('/api', '')
    return apiUrl + url
  }
  return url || defaultImage
}

const handleReserva = async () => {
  const token = localStorage.getItem('token')
  if (!token) {
    router.push('/login')
    return
  }
  message.value = ''
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    await api.post('/v1/reservas', {
      clienteId: user.id,
      habitacionId: 1,
      fechaCheckIn: checkIn.value,
      fechaCheckOut: checkOut.value,
      cantidadAdultos: 2,
      cantidadNiños: 0,
      llevaMascotas: false
    })
    messageColor.value = 'green'
    message.value = '✅ ¡Reserva creada con éxito!'
  } catch (err: any) {
    messageColor.value = 'red'
    message.value = err.response?.data?.message || 'Error al reservar'
  }
}
</script>

<template>
  <!-- Loading -->
  <div v-if="loading" class="max-w-7xl mx-auto px-4 py-20 flex justify-center">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
  </div>

  <!-- Not found -->
  <div v-else-if="!prop" class="max-w-7xl mx-auto px-4 py-20 text-center">
    <div class="text-5xl mb-4">🏚️</div>
    <p class="text-gray-500 text-lg">Propiedad no encontrada</p>
    <router-link to="/" class="text-indigo-600 hover:underline mt-4 inline-block">← Volver al inicio</router-link>
  </div>

  <!-- Property Detail -->
  <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Back -->
    <router-link to="/" class="text-indigo-600 hover:underline text-sm mb-6 inline-block">← Volver</router-link>

    <h1 class="text-3xl font-extrabold text-gray-900 mb-1">{{ prop.nombre }}</h1>
    <p class="text-gray-500 mb-6 flex items-center gap-2">
      <span>📍 {{ prop.ciudad }}<span v-if="prop.pais">, {{ prop.pais }}</span></span>
      <span>•</span>
      <span>{{ prop.calificacion?.toFixed(1) || '5.0' }} ⭐</span>
      <span v-if="prop.totalResenas">({{ prop.totalResenas }} reseñas)</span>
      <span>•</span>
      <span class="capitalize">{{ prop.tipoAlojamientoNombre }}</span>
    </p>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- Left: Photos + Description -->
      <div class="md:col-span-2 space-y-6">
        <!-- Main photo -->
        <img :src="prop.fotos?.length ? getPhoto(prop.fotos[0]) : defaultImage"
          :alt="prop.nombre"
          class="w-full h-96 object-cover rounded-2xl shadow-sm">

        <!-- Photo gallery -->
        <div v-if="prop.fotos?.length > 1" class="grid grid-cols-4 gap-2">
          <img v-for="(foto, i) in prop.fotos.slice(1, 5)" :key="i"
            :src="getPhoto(foto)" :alt="'Foto ' + (i+2)"
            class="w-full h-24 object-cover rounded-xl">
        </div>

        <!-- Description -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 class="text-xl font-bold mb-3">Acerca de este espacio</h2>
          <p class="text-gray-600 leading-relaxed">{{ prop.descripcion || 'Propiedad increíble en una ubicación privilegiada.' }}</p>
        </div>

        <!-- Amenities -->
        <div v-if="prop.instalaciones?.length" class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 class="text-xl font-bold mb-4">Servicios y amenidades</h2>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div v-for="(inst, i) in prop.instalaciones" :key="i"
              class="flex items-center gap-2 text-gray-700 text-sm bg-gray-50 px-3 py-2 rounded-lg">
              <span class="text-indigo-500">✓</span>
              {{ inst }}
            </div>
          </div>
        </div>

        <!-- Capacity -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 class="text-xl font-bold mb-3">Información</h2>
          <div class="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div class="flex items-center gap-2"><span>👥</span> Capacidad: {{ prop.capacidadMaxima || 2 }} huéspedes</div>
            <div class="flex items-center gap-2"><span>🐾</span> {{ prop.admiteMascotas ? 'Admite mascotas' : 'No admite mascotas' }}</div>
          </div>
        </div>
      </div>

      <!-- Right: Booking card -->
      <div>
        <div class="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 sticky top-20">
          <div class="text-2xl font-bold mb-1 text-indigo-600">
            ${{ prop.precioBase || 0 }}
            <span class="text-base font-normal text-gray-500">{{ prop.moneda || 'USD' }} / noche</span>
          </div>
          <div v-if="prop.calificacion" class="text-sm text-gray-500 mb-4">
            ⭐ {{ prop.calificacion?.toFixed(1) }} · {{ prop.totalResenas || 0 }} reseñas
          </div>

          <div class="space-y-4 mb-6">
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Check-in</label>
              <input v-model="checkIn" type="date"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition text-sm">
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Check-out</label>
              <input v-model="checkOut" type="date"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition text-sm">
            </div>
          </div>

          <button @click="handleReserva"
            class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md text-sm">
            Reservar ahora
          </button>

          <p v-if="message" :class="messageColor === 'green' ? 'text-green-600' : 'text-red-600'"
            class="mt-4 text-center text-sm font-medium">{{ message }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
