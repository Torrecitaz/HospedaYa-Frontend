<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { RouterView, useRouter } from 'vue-router'

const router = useRouter()
const isLogged = ref(false)
const user = ref<any>(null)

watchEffect(() => {
  const token = localStorage.getItem('token')
  const userData = localStorage.getItem('user')
  isLogged.value = !!token
  if (userData) {
    user.value = JSON.parse(userData)
  }
})

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  isLogged.value = false
  user.value = null
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 text-gray-900 font-sans">
    <!-- Navbar global -->
    <nav class="bg-white shadow border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <span class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              HospedaYa
            </span>
          </div>
          <div class="flex items-center space-x-4">
            <router-link to="/" class="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Explorar</router-link>
            
            <template v-if="!isLogged">
              <router-link to="/login" class="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Iniciar Sesión</router-link>
              <router-link to="/register" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm">Registrarse</router-link>
            </template>
            
            <template v-else>
              <router-link v-if="user?.rol === 'Anfitrion'" to="/host/dashboard" class="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Mi Panel</router-link>
              <router-link v-else to="/client/dashboard" class="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Mi Perfil</router-link>
              <button @click="handleLogout" class="text-red-600 hover:text-red-800 px-3 py-2 rounded-md text-sm font-medium transition-colors">Salir</button>
            </template>
          </div>
        </div>
      </div>
    </nav>

    <!-- Contenido dinámico -->
    <main>
      <RouterView />
    </main>
  </div>
</template>

<style>
/* Animaciones globales suaves */
.router-link-active {
  @apply font-bold text-indigo-600;
}
</style>
