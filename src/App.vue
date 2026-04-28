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
    try { user.value = JSON.parse(userData) } catch { user.value = null }
  } else {
    user.value = null
  }
})

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  isLogged.value = false
  user.value = null
  router.push('/login')
}

const getDashboardRoute = () => {
  if (!user.value) return '/login'
  if (user.value.rol === 'Admin') return '/admin/dashboard'
  if (user.value.rol === 'Anfitrion') return '/host/dashboard'
  return '/client/dashboard'
}

const getDashboardLabel = () => {
  if (!user.value) return ''
  if (user.value.rol === 'Admin') return '⚙️ Admin'
  if (user.value.rol === 'Anfitrion') return '🏠 Mi Panel'
  return '👤 Mi Perfil'
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 text-gray-900 font-sans">
    <!-- Navbar -->
    <nav class="bg-white shadow border-b border-gray-100 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <router-link to="/" class="flex items-center gap-2">
              <span class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                HospedaYa
              </span>
            </router-link>
          </div>
          <div class="flex items-center space-x-3">
            <router-link to="/"
              class="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Explorar
            </router-link>

            <template v-if="!isLogged">
              <router-link to="/login"
                class="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Iniciar Sesión
              </router-link>
              <router-link to="/register"
                class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
                Registrarse
              </router-link>
            </template>

            <template v-else>
              <router-link :to="getDashboardRoute()"
                class="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                {{ getDashboardLabel() }}
              </router-link>
              <div class="flex items-center gap-2 pl-2 border-l border-gray-200">
                <span class="text-xs text-gray-500">{{ user?.nombre }}</span>
                <button @click="handleLogout"
                  class="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-medium transition-all">
                  Salir
                </button>
              </div>
            </template>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main content -->
    <main>
      <RouterView />
    </main>
  </div>
</template>

<style>
.router-link-exact-active {
  @apply font-bold text-indigo-600;
}
</style>
