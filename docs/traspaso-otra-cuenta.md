# Traspaso a otra cuenta de Claude (17/11/2026)

Todo el trabajo vive en el repositorio de GitHub **arturoMunoz/la-otra-comunidad**. Lo que había fuera del repo (scripts de prueba) está ahora en `tools/pruebas/`. Las instrucciones de trabajo están en `CLAUDE.md` (Claude las lee solo al abrir el repo).

## Pasos en la cuenta nueva
1. En claude.ai → Ajustes → Conectores: conectar **GitHub** con la cuenta de Arturo (la que tiene permiso de escritura en el repo; sin ella se puede leer pero no subir).
2. Crear un Proyecto «LA OTRA COMUNIDAD» y pegar en sus instrucciones el bloque de abajo.
3. Abrir una sesión de Claude Code (en la web o el móvil) dentro del proyecto, con el repo `arturoMunoz/la-otra-comunidad`, y escribir el primer mensaje de abajo.
4. Los prototipos publicados como Artifact en la cuenta vieja NO se pueden tocar desde la nueva: la sesión nueva publica los suyos y actualiza los enlaces en `CLAUDE.md`.
5. Supabase y Cloudflare no cambian (no dependen de la cuenta de Claude).

## Instrucciones del Proyecto (pegar tal cual)
```
Somos Henar y Arturo (escribimos los dos desde esta cuenta). Trabajamos en el repo arturoMunoz/la-otra-comunidad: La Otra Comunidad (juego de pasos), El Abismo de Helm, La Brecha (duelos tipo Wild Rift) y A-6 (La Brecha sin Tolkien, prioridad actual). Lee CLAUDE.md y docs/traspaso-otra-cuenta.md antes de nada.
- Cuestiona las ideas con honestidad, sin halagos.
- Claude no dibuja ni genera arte: todo se pide a ChatGPT. Cada pedido en un bloque de código y diciendo si es ART (chat normal, no gasta tokens) o WORK (modo agente: modelos 3D, descargas, zips procesados).
- Todo pedido a ChatGPT sin hacer se apunta en docs/pendiente-chatgpt.md y se tacha al llegar.
- Subir (push) solo cuando digamos «súbelo».
- Supabase: solo la clave pública sb_publishable_…, nunca service_role.
```

## Primer mensaje para la sesión nueva
```
Seguimos el proyecto desde otra cuenta. Lee CLAUDE.md, docs/traspaso-otra-cuenta.md y docs/pendiente-chatgpt.md. Estamos con A-6: lo último fue el Pack 23 (HUD), el fondo del Taller y los efectos propios de cada habilidad (fxAP, proyectiles provisionales). Esperamos el arte de los Packs 18 A/B, 24 y 25. Resúmeme en 5 líneas dónde estamos y qué falta.
```

## Lo que sabía Claude de vosotros (memoria de la cuenta vieja, para no perderlo)
### La Otra Comunidad
- Minijuegos siempre arcade, basados en juegos que funcionaron. Gusta el tipo Guitar Hero («Seguir la canción»); el del sauce no gusta pero se deja.
- Mucho cuidado con la estética. Los de Android usan el juego instalado desde el navegador, no la APK.
- La hoguera es personal de cada jugador. El 10/11 el grupo lo usaba poco.
### El Abismo de Helm
- Shooter/defensa (Vampire Survivors + muralla), dentro de la app. Sin joystick visible. Construir solo entre oleadas; nada pausa la partida.
- Solo herramientas gratis (nada de Meshy). Sonidos con ElevenLabs. Sensación Supercell / Brawl Stars, «colorido pero oscuro».
- Al subir de nivel solo el árbol; armas y objetos en la tienda entre oleadas. Treguas de 15 s al morir el último enemigo.
### La Brecha
- Pegarse al Wild Rift, no inventar mecánicas; sensación Supercell. Solo móvil, en horizontal.
- En el 1v1 solo se gana tirando el estandarte. Abierto a gente de fuera. Aquí SÍ puede haber personajes del libro.
- Maná que se gasta como en el LoL, botella fucsia. Partida guiada.
### A-6 (prioridad desde el 17/11)
- La Brecha sin Tolkien ni marcas; carretera sobre un puente que cruza un barranco, paisaje a los lados.
- 7 héroes: Brask (caballero de luz), Vael (mago), Grub (maestro bajito y monstruoso), Ata (francotiradora), Birdie (golfista), Fu (ninja calvo), Moha (asesino marroquí).
- Interfaz seria tipo Supercell pero cyberpunk, nada infantil. Gustan la pantalla de carga, los retratos y el Taller tal como está.
- Quieren que cada habilidad y el básico tengan animación propia.
