import type { Messages } from "../types";

export const es: Messages = {
  meta: {
    title: "Second Sense · Reto del cronómetro de píxeles",
    description:
      "Tubos digitales rojos y botones de píxel. Confía en tu instinto durante 3, 5 o 10 segundos y detente en el momento justo.",
  },
  brand: { label: "Inicio de Second Sense" },
  locale: {
    current: "Idioma actual: {name}, haz clic para cambiarlo",
    menu: "Lista de idiomas",
  },
  sound: {
    labelOn: "Sonido on",
    labelOff: "Sonido off",
    labelUnavailable: "Sonido no disponible",
    ariaOn: "Sonido activado, pulsa para silenciar",
    ariaOff: "Sonido desactivado, pulsa para activar",
    ariaUnavailable: "Este navegador no admite sonido",
  },
  intro: { heading: "Detente en ese segundo, por instinto." },
  target: { label: "Elige un objetivo", groupLabel: "Elige una duración", option: "{n} s" },
  status: {
    ready: "Listo",
    running: "Cronómetro en marcha",
    done: "Ronda completa",
    cheating: "Cronómetro automático",
  },
  display: {
    labelTarget: "Tiempo objetivo",
    labelTargetSeconds: "Objetivo {n} s",
    labelActual: "Tiempo real",
    seconds: "{value} s",
    ariaHidden: "Cronómetro en marcha, tiempo oculto",
  },
  caption: {
    idle: "Haz clic para empezar.",
    running: "Cronómetro en marcha… detente por instinto.",
    finished: "Fin de la ronda.",
    cheat: "Automático: la pantalla va en directo y se detiene en el objetivo.",
  },
  action: {
    glyphGo: "GO",
    glyphStop: "STOP",
    labelIdle: "Empezar el reto",
    labelStop: "Detener",
    labelAgain: "Jugar otra vez",
  },
  keyboard: { hint: "Espacio para empezar / detener" },
  history: {
    title: "Últimas 5 rondas",
    empty: "Aún no hay rondas",
    target: "Objetivo {n} s",
    actual: "Real {value}",
    diffExact: "Exacto",
    diffEarly: "{value} s antes",
    diffLate: "{value} s después",
  },
  notice: { tooLong: "Más de 60 segundos.", hidden: "Cambio de página: esta ronda no cuenta." },
  victory: { hint: "Toca la pantalla / Espacio / Esc para saltar" },
  machine: { label: "Juego del cronómetro" },
  easterEggs: {
    perfect: {
      title: "Dueño del tiempo",
      messages: [
        "¿Espiaste el reloj a escondidas?",
        "Este segundo, el universo entero te obedece.",
        "Caparazón humano con un reloj atómico dentro.",
      ],
    },
    "near-one": {
      title: "Casi perfecto",
      messages: [
        "El segundo exacto está en la punta de tu dedo.",
        "0,01 segundos de diferencia: el cronómetro también sudó.",
        "Faltó tan poco que el tiempo quiso ayudarte.",
      ],
    },
    "near-two": {
      title: "Por poco",
      messages: [
        "Un intento más y lo tienes.",
        "0,02 segundos de diferencia: ya rozaste el segundo exacto.",
        "El segundo exacto se te escapó entre los dedos.",
      ],
    },
    "too-early": {
      title: "Salida a velocidad luz",
      messages: [
        "Empieza y acaba a la vez: ¿viniste solo a fichar?",
        "El botón de inicio aún no reaccionaba y ya habías salido.",
        "Lo que omitiste no fue el tiempo, fue el juego entero.",
        "Esta ronda, tu mano salió antes que tu cabeza.",
        "El segundero ni calentó y ya cruzaste la meta.",
        "El objetivo estaba cargando y tú apagaste la luz primero.",
        "El cronómetro necesita un momento para prepararse.",
        "La línea de salida olía demasiado bien: normal que te lanzaras.",
      ],
    },
    "too-late": {
      title: "Espera infinita",
      messages: [
        "No lees segundos, esperas la comida a domicilio.",
        "El cronómetro ya salió y tú sigues en tu puesto.",
        "El objetivo pasó dos veces y ¿sigues esperando los créditos?",
        "Pareces competir con el cronómetro en paciencia.",
        "Estiraste el tiempo en silencio, solo un poco.",
        "El segundero dio una vuelta entera y tú sigues madurando.",
        "Si tardas más, la siguiente ronda también bostezará.",
        "El objetivo llegó hace rato: tú esperas un sentido de ceremonia.",
      ],
    },
    wild: {
      title: "Sentido del segundo desconectado",
      messages: [
        "¿Sentido del segundo? Esto es pura suerte.",
        "Entre tú y el objetivo hay un huso horario.",
        "Tu sentido del segundo debería volver a fábrica.",
        "Tú y el objetivo estáis a un compás de distancia.",
        "Este toque: tu sentido del segundo se fue de vacaciones.",
        "Lo que pulsaste se parece mucho a otro objetivo.",
        "Qué elástico es el tiempo en tus manos.",
        "¿A ojo? Esta vez el ojo andaba algo perdido.",
      ],
    },
  },
};
