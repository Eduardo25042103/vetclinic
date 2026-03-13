# Vetclinic

Aplicación frontend para la gestión de una clínica veterinaria, desarrollada con Angular 21. Utiliza `json-server` como API REST simulada. El archivo `db.json` que contiene los datos de prueba.

## Integrantes

Henry Raul Monroy Gutierrez
Jairo Aranya Huaman
Eduardo Enrique Sánchez Peña


## Requisitos previos


- Node.js >= 18
- npm >= 11 

Se puede verificar las versiones con:

```bash
node -v
npm -v
```

## Instalación

Se puede clonar el repo y luego instalar las dependencias del proyecto:

```bash
npm install
```

## Ejecución en local

El proyecto requiere dos procesos corriendo a la vez: el servidor de desarrollo de Angular y la API simulada con `json-server`. Yo uso dos terminales separadas.

**Terminal 1 — API simulada** (En `http://localhost:3000`):

```bash
npm run api
```

**Terminal 2 — Servidor de desarrollo Angular** (En `http://localhost:4200`):

```bash
npm start
```

Abrir navegador y navegar a `http://localhost:4200`.

## Modelo de datos

El archivo `db.json` en la raíz del proyecto actúa como base de datos y se usa con `json-server`. Contiene los siguientes recursos:

| Endpoint                  | Descripción                                        |
|---------------------------|----------------------------------------------------|
| `/user`                   | Usuarios del sistema                               |
| `/roles`                  | Roles disponibles: `Owner` (dueño) y `Vet` (veterinario) |
| `/userRoles`              | Relación entre usuarios y sus roles                |
| `/ownerProfiles`          | Perfiles de dueños de mascotas                     |
| `/veterinarianProfiles`   | Perfiles de veterinarios con número de licencia y especialidad |
| `/pets`                   | Registro de mascotas                               |
| `/appointments`           | Citas médicas programadas                          |
| `/medicalRecords`         | Historial médico por mascota                       |

Los datos de prueba incluyen 5 usuarios, 5 mascotas, 6 citas y 3 registros médicos.

## Tecnologías utilizadas

- **Angular 21** — framework principal del frontend
- **TypeScript 5.9** — lenguaje de desarrollo
- **Bootstrap & Bootstrap Icons CDN** - para diseño
- **json-server** — API REST simulada para desarrollo local
