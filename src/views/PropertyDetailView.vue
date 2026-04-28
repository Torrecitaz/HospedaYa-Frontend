<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../api/axios'

const route = useRoute()
const router = useRouter()
const prop = ref<any>(null)
const loading = ref(true)

const checkIn = ref('')
const checkOut = ref('')
const adultos = ref(2)
const ninos = ref(0)
const message = ref('')
const messageColor = ref('green')
const reservando = ref(false)

const defaultImage = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'

const apiBase = (import.meta.env.VITE_API_URL || 'https://sistemaviajes-alojamiento-production.up.railway.app/api').replace('/api', '')

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
  if (url && url.startsWith('/')) return apiBase + url
  return url || defaultImage
}

const noches = computed(() => {
  if (!checkIn.value || !checkOut.value) return 0
  const diff = new Date(checkOut.value).getTime() - new Date(checkIn.value).getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
})

const totalEstimado = computed(() => {
  if (!prop.value) return 0
  return (prop.value.precioBase || 0) * noches.value
})

const today = computed(() => new Date().toISOString().split('T')[0])

const handleReserva = async () => {
  const token = localStorage.getItem('token')
  if (!token) {
    router.push('/login')
    return
  }
  if (!checkIn.value || !checkOut.value) {
    messageColor.value = 'red'
    message.value = 'Selecciona fechas de check-in y check-out'
    return
  }
  if (noches.value < 1) {
    messageColor.value = 'red'
    message.value = 'La fecha de check-out debe ser posterior al check-in'
    return
  }

  reservando.value = true
  message.value = ''
  try {
    const { data } = await api.post('/v1/reservations', {
      propiedadId: prop.value.id,
      habitacionId: 0, // Backend will use first room
      fechaCheckIn: checkIn.value,
      fechaCheckOut: checkOut.value,
      cantidadAdultos: adultos.value,
      cantidadNinos: ninos.value,
      llevaMascotas: false
    })
    messageColor.value = 'green'
    message.value = `✅ ¡Reserva ${data.codigo} confirmada! Total: $${data.total} USD`
  } catch (err: any) {
    messageColor.value = 'red'
    message.value = err.response?.data?.message || err.response?.data?.detail || 'Error al reservar'
  } finally {
    reservando.value = false
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
    <router-link to="/" class="text-indigo-600 hover:underline text-sm mb-6 inline-block">← Volver a Explorar</router-link>

    <h1 class="text-3xl font-extrabold text-gray-900 mb-1">{{ prop.nombre }}</h1>
    <p class="text-gray-500 mb-6 flex items-center gap-2 flex-wrap">
      <span>📍 {{ prop.ciudad }}<span v-if="prop.pais">, {{ prop.pais }}</span></span>
      <span>•</span>
      <span>⭐ {{ prop.calificacion?.toFixed(1) || '5.0' }}</span>
      <span v-if="prop.totalResenas">({{ prop.totalResenas }} reseñas)</span>
      <span>•</span>
      <span class="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs font-medium">{{ prop.tipoAlojamientoNombre }}</span>
    </p>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Left: Photos + Description -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Main photo -->
        <img :src="prop.fotos?.length ? getPhoto(prop.fotos[0]) : defaultImage"
          :alt="prop.nombre"
          class="w-full h-96 object-cover rounded-2xl shadow-sm">

        <!-- Photo gallery -->
        <div v-if="prop.fotos?.length > 1" class="grid grid-cols-4 gap-2">
          <img v-for="(foto, i) in prop.fotos.slice(1, 5)" :key="i"
            :src="getPhoto(foto)" :alt="'Foto ' + (i+2)"
            class="w-full h-24 object-cover rounded-xl hover:opacity-80 transition cursor-pointer">
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
              <span class="text-indigo-500 font-bold">✓</span>
              {{ inst }}
            </div>
          </div>
        </div>

        <!-- Info -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 class="text-xl font-bold mb-3">Información</h2>
          <div class="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div class="flex items-center gap-2">👥 Capacidad: {{ prop.capacidadMaxima || 2 }} huéspedes</div>
            <div class="flex items-center gap-2">🐾 {{ prop.admiteMascotas ? 'Admite mascotas' : 'No admite mascotas' }}</div>
            <div class="flex items-center gap-2">📍 {{ prop.direccion }}</div>
            <div class="flex items-center gap-2">🏷️ {{ prop.tipoAlojamientoNombre }}</div>
          </div>
        </div>
      </div>

      <!-- Right: Booking card -->
      <div>
        <div class="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 sticky top-20">
          <div class="text-3xl font-bold text-indigo-600 mb-1">
            ${{ prop.precioBase || 0 }}
          </div>
          <p class="text-gray-500 text-sm mb-4">{{ prop.moneda || 'USD' }} / noche</p>

          <div class="space-y-4 mb-4">
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">📅 Check-in</label>
              <input v-model="checkIn" type="date" :min="today"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition text-sm">
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">📅 Check-out</label>
              <input v-model="checkOut" type="date" :min="checkIn || today"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition text-sm">
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">👥 Adultos</label>
                <select v-model="adultos"
                  class="w-full px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition text-sm">
                  <option v-for="n in 10" :key="n" :value="n">{{ n }}</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">👶 Niños</label>
                <select v-model="ninos"
                  class="w-full px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition text-sm">
                  <option v-for="n in 6" :key="n-1" :value="n-1">{{ n - 1 }}</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Resumen de precio -->
          <div v-if="noches > 0" class="bg-gray-50 rounded-xl p-4 mb-4 space-y-2 text-sm">
            <div class="flex justify-between text-gray-600">
              <span>${{ prop.precioBase }} × {{ noches }} noches</span>
              <span>${{ totalEstimado }}</span>
            </div>
            <div class="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-2">
              <span>Total</span>
              <span class="text-indigo-600">${{ totalEstimado }} USD</span>
            </div>
          </div>

          <button @click="handleReserva" :disabled="reservando"
            class="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md text-sm flex items-center justify-center gap-2">
            <span v-if="reservando">⏳ Procesando...</span>
            <span v-else>🛒 Reservar ahora</span>
          </button>

          <p v-if="message" :class="messageColor === 'green' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'"
            class="mt-3 text-center text-sm font-medium py-3 px-3 rounded-xl">{{ message }}</p>

          <p class="text-xs text-gray-400 text-center mt-3">No se te cobrará hasta que el anfitrión confirme</p>
        </div>
      </div>
    </div>
  </div>
</template>
