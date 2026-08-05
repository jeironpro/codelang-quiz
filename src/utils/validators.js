import { DIFICULTADES, OPCIONES, TIPOS } from './constants';

// Validación del esquema de cada pregunta del dataset.
// Devuelve un array de errores; vacío si la pregunta es válida.
export function validarPregunta(pregunta, indice = '') {
    const errores = [];
    const prefijo = `pregunta[${indice}]`;

    // Un objeto roto se descarta de inmediato con un unico error.
    if (!pregunta || typeof pregunta !== 'object') {
        return [`${prefijo}: no es un objeto`];
    }

    if (typeof pregunta.id !== 'string' || pregunta.id.length === 0) {
        errores.push(`${prefijo}.id: debe ser un string no vacío`);
    }

    // La dificultad debe estar en DIFICULTADES (facil, media, dificil).
    if (!Object.prototype.hasOwnProperty.call(DIFICULTADES, pregunta.dificultad)) {
        errores.push(
            `${prefijo}.dificultad: debe ser una de ${Object.keys(DIFICULTADES).join(', ')}`,
        );
    }

    // El tipo debe estar en TIPOS (output, sintaxis, bug, concepto).
    if (!Object.prototype.hasOwnProperty.call(TIPOS, pregunta.tipo)) {
        errores.push(`${prefijo}.tipo: debe ser una de ${Object.keys(TIPOS).join(', ')}`);
    }

    if (typeof pregunta.pregunta !== 'string' || pregunta.pregunta.trim().length === 0) {
        errores.push(`${prefijo}.pregunta: debe ser un string no vacío`);
    }

    // El codigo es opcional pero, si existe, debe ser un string.
    if (pregunta.codigo !== undefined && typeof pregunta.codigo !== 'string') {
        errores.push(`${prefijo}.codigo: debe ser un string`);
    }

    // Las opciones deben existir y tener las cuatro letras A-D con texto.
    if (!pregunta.opciones || typeof pregunta.opciones !== 'object') {
        errores.push(`${prefijo}.opciones: debe ser un objeto con claves ${OPCIONES.join(', ')}`);
    } else {
        for (const letra of OPCIONES) {
            if (
                typeof pregunta.opciones[letra] !== 'string' ||
                pregunta.opciones[letra].trim() === ''
            ) {
                errores.push(`${prefijo}.opciones.${letra}: debe ser un string no vacío`);
            }
        }
    }

    // La respuesta debe ser una letra valida y apuntar a una opcion con texto.
    if (typeof pregunta.respuesta !== 'string' || !OPCIONES.includes(pregunta.respuesta)) {
        errores.push(`${prefijo}.respuesta: debe ser una de ${OPCIONES.join(', ')}`);
    } else if (pregunta.opciones && typeof pregunta.opciones[pregunta.respuesta] !== 'string') {
        errores.push(
            `${prefijo}.respuesta: la letra ${pregunta.respuesta} debe existir en opciones`,
        );
    }

    if (typeof pregunta.explicacion !== 'string' || pregunta.explicacion.trim().length === 0) {
        errores.push(`${prefijo}.explicacion: debe ser un string no vacío`);
    }

    return errores;
}

// Valida el dataset completo (objeto idioma -> array de preguntas).
// Devuelve la lista acumulada de errores, o array vacío si todo es correcto.
// Tambien controla que los ids sean unicos entre todos los lenguajes.
export function validarDataset(dataset) {
    const errores = [];
    const ids = new Set();

    for (const [lenguaje, preguntas] of Object.entries(dataset)) {
        if (!Array.isArray(preguntas)) {
            errores.push(`${lenguaje}: debe ser un array`);
            continue;
        }
        preguntas.forEach((pregunta, i) => {
            errores.push(...validarPregunta(pregunta, `${lenguaje}[${i}]`));
            // Deteccion de ids repetidos a nivel global.
            if (pregunta && typeof pregunta.id === 'string') {
                if (ids.has(pregunta.id)) {
                    errores.push(`id duplicado: ${pregunta.id}`);
                }
                ids.add(pregunta.id);
            }
        });
    }

    return errores;
}
