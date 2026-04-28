<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api/axios'

const router = useRouter()
const email = ref('')
const password = ref('')
const nombreCompleto = ref('')
const telefono = ref('')
const esAnfitrion = ref(false)
const error = ref('')

const handleRegister = async () => {
  error.value = ''
  try {
    const { data } = await api.post('/v1/auth/register', {
      email: email.value,
      password: password.value,
      nombreCompleto: nombreCompleto.value,
      telefono: telefono.value,
      esAnfitrion: esAnfitrion.value
    })
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))

    const rol = data.user.rol
    if (rol === 'Admin') {
      router.push('/admin/dashboard')
    } else if (rol === 'Anfitrion') {
      router.push('/host/dashboard')
    } else {
      router.push('/client/dashboard')
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error en el registro'
  }
}
</script>

<template>
  <div class="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-50">
      <div>
        <h2 class="mt-2 text-center text-3xl font-extrabold text-gray-900">Crea tu cuenta</h2>
        <p class="mt-2 text-center text-sm text-gray-600">Únete a la mejor comunidad de alojamientos</p>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
        <div class="space-y-4">
          <div>
            <label class="sr-only">Nombre Completo</label>
            <input v-model="nombreCompleto" type="text" required class="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="Nombre Completo">
          </div>
          <div>
            <label class="sr-only">Teléfono</label>
            <input v-model="telefono" type="text" required class="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="Teléfono">
          </div>
          <div>
            <label class="sr-only">Correo electrónico</label>
            <input v-model="email" type="email" required class="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="Correo electrónico">
          </div>
          <div>
            <label class="sr-only">Contraseña</label>
            <input v-model="password" type="password" required class="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="Contraseña">
          </div>
          <div class="flex items-center">
            <input id="esAnfitrion" v-model="esAnfitrion" type="checkbox" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
            <label for="esAnfitrion" class="ml-2 block text-sm text-gray-900">
              Quiero ser Anfitrión (Publicar propiedades)
            </label>
          </div>
        </div>

        <div v-if="error" class="text-red-500 text-sm text-center font-medium">{{ error }}</div>

        <div>
          <button type="submit" class="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-colors">
            Registrarse
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
