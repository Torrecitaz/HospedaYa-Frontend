<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api/axios'

const router = useRouter()
const email = ref('')
const password = ref('')
const error = ref('')

const handleLogin = async () => {
  error.value = ''
  try {
    const { data } = await api.post('/v1/auth/login', { email: email.value, password: password.value })
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
    error.value = err.response?.data?.message || 'Credenciales inválidas'
  }
}
</script>

<template>
  <div class="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-50">
      <div>
        <h2 class="mt-2 text-center text-3xl font-extrabold text-gray-900">Bienvenido de nuevo</h2>
        <p class="mt-2 text-center text-sm text-gray-600">Ingresa a tu cuenta para gestionar tus reservas</p>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="space-y-4">
          <div>
            <label for="email" class="sr-only">Correo electrónico</label>
            <input id="email" v-model="email" type="email" required class="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-colors" placeholder="Correo electrónico">
          </div>
          <div>
            <label for="password" class="sr-only">Contraseña</label>
            <input id="password" v-model="password" type="password" required class="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-colors" placeholder="Contraseña">
          </div>
        </div>

        <div v-if="error" class="text-red-500 text-sm text-center font-medium">{{ error }}</div>

        <div>
          <button type="submit" class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-md transition-colors">
            Iniciar sesión
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
