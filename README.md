Prototipo estático HTML/CSS/JS para referencia de diseño (UX/UI). Sin build, sin backend.

## Pantallas

Empieza por `index.html`. Flujo:

| Archivo | Descripción |
|---|---|
| `pages/albergue/signup-albergue.html` | Crear cuenta |
| `pages/albergue/login-albergue.html` | Login |
| `pages/albergue/panel-albergue.html` | Panel (lista + estado + modal tutor) |
| `pages/albergue/registrar-animal-albergue.html` | Registrar animal + éxito |
| `pages/animal/perfil-animal.html` | Ficha pública (`?codigo=HU-0001`) |

## Estructura

```
index.html     mapa del flujo (entrada)
index.css      estilos del mapa
assets/        logo, favicon, fotos
css/
  tokens.css   variables de diseño
  mvp.css      pantallas del MVP
js/
  mvp-shared.js
  auth-albergue.js
  panel-albergue.js
  registrar-animal-albergue.js
  perfil-animal.js
pages/         pantallas HTML
```

Cada pantalla carga `mvp.css` + `mvp-shared.js` + el JS de esa pantalla.
