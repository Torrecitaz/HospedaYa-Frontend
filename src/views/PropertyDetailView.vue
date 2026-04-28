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

const handleReserva = async () => {
  const token = localStorage.getItem('token')
  if (!token) {
    router.push('/login')
    return
  }

  try {
    await api.post('/v1/reservations', {
      propiedadId: prop.value.id,
      checkIn: checkIn.value,
      checkOut: checkOut.value,
      habitaciones: [{ habitacionId: prop.value.habitaciones[0]?.id || 1, noches: 1 }],
      adultos: 2
    })
    message.value = 'Reserva creada con éxito. Pendiente de pago.'
  } catch (err: any) {
    message.value = err.response?.data?.message || 'Error al reservar'
  }
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" v-if="loading">
    <div class="flex justify-center py-20"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>
  </div>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" v-else-if="prop">
    <h1 class="text-3xl font-extrabold text-gray-900 mb-2">{{ prop.nombre }}</h1>
    <p class="text-gray-500 mb-6">{{ prop.ciudad }} • {{ prop.calificacion }} ⭐</p>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div class="md:col-span-2 space-y-6">
        <img :src="prop.imagenesUrls?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'" class="w-full h-96 object-cover rounded-2xl shadow-sm">
        <h2 class="text-2xl font-bold">Acerca de este espacio</h2>
        <p class="text-gray-600">{{ prop.descripcion || 'Propiedad increíble en el centro de la ciudad.' }}</p>
      </div>

      <div>
        <div class="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 sticky top-6">
          <div class="text-2xl font-bold mb-4">${{ prop.precioPorNoche }} <span class="text-base font-normal text-gray-500">noche</span></div>
          <div class="space-y-4 mb-6">
            <input v-model="checkIn" type="date" class="w-full px-4 py-3 border border-gray-300 rounded-lg">
            <input v-model="checkOut" type="date" class="w-full px-4 py-3 border border-gray-300 rounded-lg">
          </div>
          <button @click="handleReserva" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">Reservar</button>
          <p v-if="message" class="mt-4 text-center text-sm font-medium text-green-600">{{ message }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
