import NotAPage from "@/data/components/NotAPage"
import { languageType } from "./_languageType"

export const ES_ES: languageType = {
  name: "Español",
  action: {
    blog: {
      delete: "Eliminar",
      export: "Exportar",
      select: "Seleccionar",
      edit: "Editar",
      close: "Cerrar",
      openNew: "Nueva entrada",
      setting: "Ajustes",
      toggleFullScreen: "Pantalla completa",
      done: "Hecho",
      read: "Leer",
      readDone: "Cerrar",
    },
    input: {
      addTag: "Añadir etiqueta...",
      folderName: "Nombre carpeta",
      title: "Título"
    },
    selectMode: {
      none: "Nada seleccionado",
      select: "$1 seleccionado(s)",
    },
  },
  window: {
    action: {
      selectFile: "Seleccionar archivo",
      export: "Exportar",
      cancel: "Cancelar",
    },
    message: {
      import: "Esto SOBRESCRIBIRÁ todos los datos actuales. No se puede deshacer.<br>¿Estás seguro?",
      merge: "Combinar importa elementos nuevos sin borrar los existentes.<br>Si hay coincidencias, la versión nueva tiene prioridad.",
      export: {
        all: "¿Exportar todo?",
        selected: "Se exportarán los siguientes elementos:",
        single: "¿Exportar $1?",
      },
      delete: {
        first: {
          multi: "Los elementos seleccionados se eliminarán permanentemente.",
          single: "$1 se eliminará permanentemente.",
        },
        next: {
          message: "¿Seguro que quieres eliminar? Esta acción es irreversible.",
          yap: "Eliminar",
          nah: "Cancelar",
        }
      }
    }
  },
  setting: {
    title: {
      language: "Idioma",
      powerSavingMode: "Ahorro energía",
      fancyMode: "Modo visual",
      hideContent: "Modo privacidad",
      save: "Gestión datos",
      scale: "Escala interfaz",
      readonly: "Solo lectura",
    },
    info: {
      language: "Idioma de la interfaz",
      powerSavingMode: "Simplifica el renderizado para ahorrar batería. Desactiva algunos efectos.",
      fancyMode: "Activa todas las animaciones y efectos.",
      hideContent: "Oculta el texto con caracteres aleatorios. Ideal para streaming. [No afecta al editor]",
      hideContent1: "El texto dentro del editor permanece visible.",
      save: "Total: $1 blogs, $2 etiquetas",
      scale: "Ajusta el tamaño de la interfaz.",
      readonly: "Desactiva la edición para evitar cambios accidentales.",
      readonly1: "Clic derecho (o mantener pulsado) para desactivar.",
    },
    buttonsText: {
      default: {
        enable: "ON",
        disable: "OFF",
      },
      save: {
        export: "Exportar Datos",
        import: "Importar Datos",
        merge: "Combinar Datos",
      },
    },
    action: {
      reset: "Restablecer",
      close: "Cerrar"
    }
  }
}

export default function () {
  return <NotAPage info={[
    `ES_ES (${ES_ES.name}) 的语言定义`
  ]} />
}