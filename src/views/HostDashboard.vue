<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api/axios'

const router = useRouter()
const user = JSON.parse(localStorage.getItem('user') || '{}')

// Catálogos
const ciudades = ref<any[]>([])
const tiposAlojamiento = ref<any[]>([])
const serviciosDisponibles = ref<any[]>([])

// Estado del formulario
const nuevaPropiedad = ref({
  nombre: '',
  descripcion: '',
  ciudadId: 0,
  direccion: '',
  precioPorNoche: 50,
  capacidadAdultos: 2,
  tipoAlojamientoId: 1
})
const serviciosSeleccionados = ref<number[]>([])
const fotos = ref<File[]>([])
const fotoPreviews = ref<string[]>([])
const mensaje = ref('')
const mensajeColor = ref('green')
const cargando = ref(false)

// Mis propiedades
const misPropiedades = ref<any[]>([])
const activeTab = ref('crear')

onMounted(async () => {
  if (user.rol !== 'Anfitrion' && user.rol !== 'Admin') {
    router.push('/')
    return
  }
  try {
    const [ciudadesRes, tiposRes, serviciosRes, propsRes] = await Promise.allSettled([
      api.get('/v1/catalogos/ciudades'),
      api.get('/v1/catalogos/tipos-alojamiento'),
      api.get('/v1/catalogos/servicios'),
      api.get('/v1/properties?pageNumber=1&pageSize=20')
    ])

    if (ciudadesRes.status === 'fulfilled') {
      ciudades.value = ciudadesRes.value.data
      if (ciudades.value.length > 0) nuevaPropiedad.value.ciudadId = ciudades.value[0].ciudadId
    }
    if (tiposRes.status === 'fulfilled') {
      tiposAlojamiento.value = tiposRes.value.data
      if (tiposAlojamiento.value.length > 0) nuevaPropiedad.value.tipoAlojamientoId = tiposAlojamiento.value[0].tipoAlojamientoId
    }
    if (serviciosRes.status === 'fulfilled') serviciosDisponibles.value = serviciosRes.value.data
    if (propsRes.status === 'fulfilled') {
      const data = propsRes.value.data
      misPropiedades.value = Array.isArray(data) ? data : (data?.items || [])
    }
  } catch (e) { console.error(e) }
})

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    fotos.value = Array.from(target.files)
    fotoPreviews.value = []
    fotos.value.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => fotoPreviews.value.push(e.target?.result as string)
      reader.readAsDataURL(file)
    })
  }
}

const toggleServicio = (id: number) => {
  const idx = serviciosSeleccionados.value.indexOf(id)
  if (idx === -1) serviciosSeleccionados.value.push(id)
  else serviciosSeleccionados.value.splice(idx, 1)
}

const crearPropiedad = async () => {
  cargando.value = true
  mensaje.value = ''
  try {
    const formData = new FormData()
    formData.append('Nombre', nuevaPropiedad.value.nombre)
    formData.append('Descripcion', nuevaPropiedad.value.descripcion)
    formData.append('CiudadId', nuevaPropiedad.value.ciudadId.toString())
    formData.append('Direccion', nuevaPropiedad.value.direccion)
    formData.append('PrecioPorNoche', nuevaPropiedad.value.precioPorNoche.toString())
    formData.append('CapacidadAdultos', nuevaPropiedad.value.capacidadAdultos.toString())
    formData.append('TipoAlojamientoId', nuevaPropiedad.value.tipoAlojamientoId.toString())
    fotos.value.forEach(foto => formData.append('Fotos', foto))

    await api.post('/v1/properties', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    mensajeColor.value = 'green'
    mensaje.value = '✅ ¡Propiedad publicada con éxito!'
    nuevaPropiedad.value = { nombre: '', descripcion: '', ciudadId: ciudades.value[0]?.ciudadId || 0, direccion: '', precioPorNoche: 50, capacidadAdultos: 2, tipoAlojamientoId: tiposAlojamiento.value[0]?.tipoAlojamientoId || 1 }
    fotos.value = []
    fotoPreviews.value = []
    serviciosSeleccionados.value = []

    // Refrescar propiedades
    const propsRes = await api.get('/v1/properties?pageNumber=1&pageSize=20')
    const data = propsRes.data
    misPropiedades.value = Array.isArray(data) ? data : (data?.items || [])
    activeTab.value = 'mis-propiedades'
  } catch (error: any) {
    mensajeColor.value = 'red'
    mensaje.value = '❌ Error: ' + (error.response?.data?.message || error.message)
  } finally {
    cargando.value = false
  }
}

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-gradient-to-r from-indigo-600 to-purple-700 text-white shadow-lg">
      <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">🏠</div>
          <div>
            <h1 class="font-bold text-lg">Panel de Anfitrión</h1>
            <p class="text-indigo-200 text-xs">{{ user.nombre }}</p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <span class="bg-white/10 text-white text-xs px-3 py-1 rounded-full">{{ misPropiedades.length }} propiedades</span>
          <button @click="logout" class="bg-white/10 hover:bg-white/20 text-white text-sm px-4 py-2 rounded-lg transition">
            Salir
          </button>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Stats -->
      <div class="grid grid-cols-3 gap-4 mb-8">
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 text-center">
          <p class="text-3xl font-bold text-indigo-600">{{ misPropiedades.length }}</p>
          <p class="text-gray-500 text-sm mt-1">Propiedades</p>
        </div>
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 text-center">
          <p class="text-3xl font-bold text-green-600">0</p>
          <p class="text-gray-500 text-sm mt-1">Reservas Activas</p>
        </div>
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 text-center">
          <p class="text-3xl font-bold text-yellow-600">★ 5.0</p>
          <p class="text-gray-500 text-sm mt-1">Calificación</p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex gap-2 mb-6 bg-white p-1 rounded-xl shadow-sm border border-gray-100 w-fit">
        <button v-for="tab in ['crear', 'mis-propiedades']" :key="tab"
          @click="activeTab = tab"
          :class="activeTab === tab ? 'bg-indigo-600 text-white shadow' : 'text-gray-600 hover:bg-gray-50'"
          class="px-5 py-2 rounded-lg text-sm font-medium transition-all">
          {{ tab === 'crear' ? '➕ Publicar Propiedad' : '🏘️ Mis Propiedades' }}
        </button>
      </div>

      <!-- Formulario Crear Propiedad -->
      <div v-if="activeTab === 'crear'" class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Publicar Nueva Propiedad</h2>
        <form @submit.prevent="crearPropiedad" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <!-- Nombre -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Nombre de la propiedad *</label>
              <input v-model="nuevaPropiedad.nombre" required placeholder="Ej: Suite Ejecutiva Centro"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm">
            </div>
            <!-- Tipo -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Tipo de Alojamiento *</label>
              <select v-model="nuevaPropiedad.tipoAlojamientoId"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm">
                <option v-for="tipo in tiposAlojamiento" :key="tipo.tipoAlojamientoId" :value="tipo.tipoAlojamientoId">
                  {{ tipo.nombre }}
                </option>
              </select>
            </div>
            <!-- Ciudad -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Ciudad *</label>
              <select v-model="nuevaPropiedad.ciudadId"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm">
                <option v-for="ciudad in ciudades" :key="ciudad.ciudadId" :value="ciudad.ciudadId">
                  {{ ciudad.nombre }} — {{ ciudad.pais }}
                </option>
              </select>
            </div>
            <!-- Dirección -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Dirección Exacta *</label>
              <input v-model="nuevaPropiedad.direccion" required placeholder="Av. Principal 123, Piso 4"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm">
            </div>
            <!-- Precio -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Precio por Noche (USD) *</label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">$</span>
                <input v-model="nuevaPropiedad.precioPorNoche" type="number" min="1" required
                  class="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm">
              </div>
            </div>
            <!-- Capacidad -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Capacidad Máxima (Adultos) *</label>
              <input v-model="nuevaPropiedad.capacidadAdultos" type="number" min="1" max="20" required
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm">
            </div>
          </div>

          <!-- Descripción -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Descripción *</label>
            <textarea v-model="nuevaPropiedad.descripcion" required rows="3"
              placeholder="Describe tu propiedad: ubicación, características especiales, entorno..."
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm resize-none"></textarea>
          </div>

          <!-- Servicios -->
          <div v-if="serviciosDisponibles.length > 0">
            <label class="block text-sm font-semibold text-gray-700 mb-3">Servicios y Amenidades</label>
            <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
              <button v-for="s in serviciosDisponibles" :key="s.servicioId" type="button"
                @click="toggleServicio(s.servicioId)"
                :class="serviciosSeleccionados.includes(s.servicioId)
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'"
                class="px-3 py-2 border rounded-xl text-xs font-medium transition-all text-center">
                {{ s.nombre }}
              </button>
            </div>
          </div>

          <!-- Fotos -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Fotos de la Propiedad</label>
            <label class="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition">
              <div class="text-center">
                <div class="text-3xl mb-2">📷</div>
                <p class="text-sm text-gray-500">Haz clic para subir fotos</p>
                <p class="text-xs text-gray-400 mt-1">JPG, PNG, WEBP — máx. 10MB por imagen</p>
              </div>
              <input type="file" multiple @change="handleFileUpload" accept="image/*" class="hidden">
            </label>
            <!-- Previews -->
            <div v-if="fotoPreviews.length > 0" class="grid grid-cols-4 gap-3 mt-3">
              <div v-for="(preview, i) in fotoPreviews" :key="i" class="relative aspect-square">
                <img :src="preview" class="w-full h-full object-cover rounded-xl border border-gray-200">
                <span v-if="i === 0"
                  class="absolute top-1 left-1 bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">Portada</span>
              </div>
            </div>
          </div>

          <!-- Submit -->
          <button type="submit" :disabled="cargando"
            class="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white py-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2">
            <span v-if="cargando">⏳ Publicando...</span>
            <span v-else>🚀 Publicar Propiedad</span>
          </button>

          <p v-if="mensaje" :class="mensajeColor === 'green' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'"
            class="text-center font-medium text-sm py-3 px-4 rounded-xl">{{ mensaje }}</p>
        </form>
      </div>

      <!-- Mis Propiedades -->
      <div v-if="activeTab === 'mis-propiedades'">
        <div v-if="misPropiedades.length === 0" class="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <div class="text-5xl mb-4">🏠</div>
          <p class="text-gray-500 mb-4">Aún no tienes propiedades publicadas</p>
          <button @click="activeTab = 'crear'"
            class="bg-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-indigo-700 transition">
            Publicar mi primera propiedad
          </button>
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="prop in misPropiedades" :key="prop.id"
            class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
            <div class="h-40 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
              <img v-if="prop.fotos && prop.fotos[0]" :src="prop.fotos[0]" class="w-full h-full object-cover" />
              <div v-else class="text-4xl">🏠</div>
            </div>
            <div class="p-5">
              <h3 class="font-bold text-gray-900 mb-1">{{ prop.nombre }}</h3>
              <p class="text-gray-500 text-sm mb-3">{{ prop.direccion }}</p>
              <div class="flex items-center justify-between">
                <span class="text-indigo-600 font-bold">${{ prop.precioBase || '—' }}/noche</span>
                <span :class="prop.estadoPropiedad === 'Activa' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'"
                  class="text-xs px-3 py-1 rounded-full font-medium">
                  {{ prop.estadoPropiedad || 'Pendiente' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
